import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FileParserService, ParsedContact } from "./file-parser.service";
import {
  CreateContactDto,
  UpdateContactDto,
  QueryContactDto,
  UploadContactsDto,
} from "./dto";
import { Contact } from "./entities/contact.entity";

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private prisma: PrismaService,
    private fileParser: FileParserService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      // 전화번호 중복 체크
      const existingContact = await this.prisma.contact.findUnique({
        where: { phone: createContactDto.phone },
      });

      if (existingContact) {
        throw new BadRequestException("이미 등록된 전화번호입니다.");
      }

      const contact = await this.prisma.contact.create({
        data: createContactDto,
      });

      return contact as Contact;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("연락처 생성에 실패했습니다.");
    }
  }

  async findAll(queryDto: QueryContactDto) {
    const {
      page = 1,
      limit = 20,
      search,
      groupName,
      isActive,
      sort = "createdAt:desc",
    } = queryDto;
    const skip = (page - 1) * limit;

    // 정렬 파싱
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = { [sortField]: sortOrder || "desc" };

    // 검색 조건 구성
    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          phone: {
            contains: search,
          },
        },
      ];
    }

    if (groupName) {
      where.groupName = groupName;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    try {
      const [contacts, total] = await Promise.all([
        this.prisma.contact.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.contact.count({ where }),
      ]);

      return {
        data: contacts as Contact[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException("연락처 목록 조회에 실패했습니다.");
    }
  }

  async findOne(id: string): Promise<Contact> {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id },
      });

      if (!contact) {
        throw new NotFoundException("연락처를 찾을 수 없습니다.");
      }

      return contact as Contact;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("연락처 조회에 실패했습니다.");
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    // 연락처 존재 확인
    await this.findOne(id);

    // 전화번호 변경 시 중복 체크
    if (updateContactDto.phone) {
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          phone: updateContactDto.phone,
          id: { not: id },
        },
      });

      if (existingContact) {
        throw new BadRequestException("이미 등록된 전화번호입니다.");
      }
    }

    try {
      const contact = await this.prisma.contact.update({
        where: { id },
        data: {
          ...updateContactDto,
          updatedAt: new Date(),
        },
      });

      return contact as Contact;
    } catch (error) {
      throw new BadRequestException("연락처 수정에 실패했습니다.");
    }
  }

  async remove(id: string): Promise<void> {
    // 연락처 존재 확인
    await this.findOne(id);

    try {
      await this.prisma.contact.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException("연락처 삭제에 실패했습니다.");
    }
  }

  async uploadContacts(
    file: Express.Multer.File,
    uploadDto: UploadContactsDto,
  ) {
    try {
      this.logger.log(`Starting contact upload: ${file.originalname}`);

      // 파일 파싱
      const parseResult = await this.fileParser.parseFile(file, {
        defaultGroupName: uploadDto.defaultGroupName,
        skipInvalid: uploadDto.skipInvalid,
      });

      const { contacts, errors, summary } = parseResult;

      // 데이터베이스에 저장
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [...errors],
      };

      for (const [index, contact] of contacts.entries()) {
        try {
          const existingContact = await this.prisma.contact.findUnique({
            where: { phone: contact.phone },
          });

          if (existingContact) {
            if (uploadDto.overwriteDuplicates) {
              // 기존 연락처 업데이트
              await this.prisma.contact.update({
                where: { phone: contact.phone },
                data: {
                  ...contact,
                  updatedAt: new Date(),
                },
              });
              results.updated++;
            } else {
              // 중복으로 건너뛰기
              results.skipped++;
            }
          } else {
            // 새 연락처 생성
            await this.prisma.contact.create({
              data: contact,
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            row: index + 2,
            data: contact,
            error: error.message,
          });
        }
      }

      this.logger.log(`Contact upload completed: ${JSON.stringify(results)}`);

      return {
        summary: {
          ...summary,
          created: results.created,
          updated: results.updated,
          skipped: results.skipped,
        },
        errors: results.errors,
      };
    } catch (error) {
      this.logger.error("Contact upload failed", error);
      throw error;
    }
  }

  async getGroups() {
    try {
      const groups = await this.prisma.contact.groupBy({
        by: ["groupName"],
        where: {
          groupName: { not: null },
          isActive: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });

      return groups.map((group) => ({
        name: group.groupName,
        count: group._count.id,
      }));
    } catch (error) {
      throw new BadRequestException("그룹 목록 조회에 실패했습니다.");
    }
  }

  async getStats() {
    try {
      const [total, active, inactive, groups] = await Promise.all([
        this.prisma.contact.count(),
        this.prisma.contact.count({ where: { isActive: true } }),
        this.prisma.contact.count({ where: { isActive: false } }),
        this.prisma.contact.groupBy({
          by: ["groupName"],
          where: { groupName: { not: null } },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        totalGroups: groups.length,
      };
    } catch (error) {
      throw new BadRequestException("연락처 통계 조회에 실패했습니다.");
    }
  }

  async bulkDelete(ids: string[]) {
    try {
      const result = await this.prisma.contact.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        deleted: result.count,
        message: `${result.count}개의 연락처가 삭제되었습니다.`,
      };
    } catch (error) {
      throw new BadRequestException("일괄 삭제에 실패했습니다.");
    }
  }

  async bulkUpdateGroup(ids: string[], groupName: string) {
    try {
      const result = await this.prisma.contact.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          groupName,
          updatedAt: new Date(),
        },
      });

      return {
        updated: result.count,
        message: `${result.count}개의 연락처 그룹이 변경되었습니다.`,
      };
    } catch (error) {
      throw new BadRequestException("일괄 그룹 변경에 실패했습니다.");
    }
  }

  // 샘플 템플릿 다운로드
  getSampleTemplate(): Buffer {
    return this.fileParser.generateSampleTemplate();
  }
}
