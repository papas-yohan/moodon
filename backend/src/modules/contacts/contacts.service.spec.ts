import { Test, TestingModule } from "@nestjs/testing";
import { ContactsService } from "./contacts.service";
import { FileParserService } from "./file-parser.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateContactDto, UpdateContactDto, QueryContactDto } from "./dto";

describe("ContactsService", () => {
  let service: ContactsService;
  let prisma: PrismaService;
  let fileParser: FileParserService;

  const mockPrismaService = {
    contact: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockFileParserService = {
    parseFile: jest.fn(),
    generateSampleTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FileParserService,
          useValue: mockFileParserService,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prisma = module.get<PrismaService>(PrismaService);
    fileParser = module.get<FileParserService>(FileParserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("연락처를 성공적으로 생성해야 함", async () => {
      // Arrange
      const createDto: CreateContactDto = {
        name: "홍길동",
        phone: "01012345678",
        kakaoId: "hong123",
        groupName: "VIP고객",
        tags: "신규고객",
      };
      const expectedContact = {
        id: "contact-1",
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.contact.findUnique.mockResolvedValue(null);
      mockPrismaService.contact.create.mockResolvedValue(expectedContact);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedContact);
      expect(mockPrismaService.contact.findUnique).toHaveBeenCalledWith({
        where: { phone: createDto.phone },
      });
      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it("중복된 전화번호일 때 BadRequestException을 던져야 함", async () => {
      // Arrange
      const createDto: CreateContactDto = {
        name: "홍길동",
        phone: "01012345678",
      };
      const existingContact = { id: "existing-1", phone: "01012345678" };

      mockPrismaService.contact.findUnique.mockResolvedValue(existingContact);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("페이지네이션된 연락처 목록을 반환해야 함", async () => {
      // Arrange
      const queryDto: QueryContactDto = { page: 1, limit: 10 };
      const contacts = [
        { id: "1", name: "홍길동", phone: "01012345678" },
        { id: "2", name: "김철수", phone: "01087654321" },
      ];
      const total = 2;

      mockPrismaService.contact.findMany.mockResolvedValue(contacts);
      mockPrismaService.contact.count.mockResolvedValue(total);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual({
        data: contacts,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("검색 조건이 있을 때 필터링된 결과를 반환해야 함", async () => {
      // Arrange
      const queryDto: QueryContactDto = { search: "홍길동" };
      const contacts = [{ id: "1", name: "홍길동", phone: "01012345678" }];

      mockPrismaService.contact.findMany.mockResolvedValue(contacts);
      mockPrismaService.contact.count.mockResolvedValue(1);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                name: {
                  contains: "홍길동",
                },
              },
              {
                phone: {
                  contains: "홍길동",
                },
              },
            ],
          },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("ID로 연락처를 찾아 반환해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      const expectedContact = {
        id: contactId,
        name: "홍길동",
        phone: "01012345678",
      };

      mockPrismaService.contact.findUnique.mockResolvedValue(expectedContact);

      // Act
      const result = await service.findOne(contactId);

      // Assert
      expect(result).toEqual(expectedContact);
      expect(mockPrismaService.contact.findUnique).toHaveBeenCalledWith({
        where: { id: contactId },
      });
    });

    it("연락처를 찾을 수 없을 때 NotFoundException을 던져야 함", async () => {
      // Arrange
      const contactId = "non-existent-id";
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(contactId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("연락처를 성공적으로 수정해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      const updateDto: UpdateContactDto = { name: "수정된 이름" };
      const existingContact = { id: contactId, name: "기존 이름" };
      const updatedContact = { ...existingContact, ...updateDto };

      mockPrismaService.contact.findUnique.mockResolvedValue(existingContact);
      mockPrismaService.contact.findFirst.mockResolvedValue(null);
      mockPrismaService.contact.update.mockResolvedValue(updatedContact);

      // Act
      const result = await service.update(contactId, updateDto);

      // Assert
      expect(result).toEqual(updatedContact);
      expect(mockPrismaService.contact.update).toHaveBeenCalledWith({
        where: { id: contactId },
        data: {
          ...updateDto,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe("remove", () => {
    it("연락처를 성공적으로 삭제해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      const existingContact = { id: contactId, name: "홍길동" };

      mockPrismaService.contact.findUnique.mockResolvedValue(existingContact);
      mockPrismaService.contact.delete.mockResolvedValue(existingContact);

      // Act
      await service.remove(contactId);

      // Assert
      expect(mockPrismaService.contact.delete).toHaveBeenCalledWith({
        where: { id: contactId },
      });
    });
  });

  describe("uploadContacts", () => {
    it("파일 업로드를 성공적으로 처리해야 함", async () => {
      // Arrange
      const file = {
        originalname: "contacts.xlsx",
        buffer: Buffer.from("test"),
      } as Express.Multer.File;
      const uploadDto = {
        defaultGroupName: "업로드그룹",
        overwriteDuplicates: false,
        skipInvalid: true,
      };
      const parseResult = {
        contacts: [
          { name: "홍길동", phone: "01012345678", groupName: "업로드그룹" },
          { name: "김철수", phone: "01087654321", groupName: "업로드그룹" },
        ],
        errors: [],
        summary: { total: 2, valid: 2, invalid: 0 },
      };

      mockFileParserService.parseFile.mockResolvedValue(parseResult);
      mockPrismaService.contact.findUnique.mockResolvedValue(null);
      mockPrismaService.contact.create.mockResolvedValue({});

      // Act
      const result = await service.uploadContacts(file, uploadDto);

      // Assert
      expect(result.summary.created).toBe(2);
      expect(result.summary.total).toBe(2);
      expect(mockFileParserService.parseFile).toHaveBeenCalledWith(file, {
        defaultGroupName: "업로드그룹",
        skipInvalid: true,
      });
    });
  });

  describe("getGroups", () => {
    it("그룹 목록을 반환해야 함", async () => {
      // Arrange
      const groups = [
        { groupName: "VIP고객", _count: { id: 3 } },
        { groupName: "일반고객", _count: { id: 2 } },
      ];

      mockPrismaService.contact.groupBy.mockResolvedValue(groups);

      // Act
      const result = await service.getGroups();

      // Assert
      expect(result).toEqual([
        { name: "VIP고객", count: 3 },
        { name: "일반고객", count: 2 },
      ]);
    });
  });

  describe("getStats", () => {
    it("연락처 통계를 반환해야 함", async () => {
      // Arrange
      mockPrismaService.contact.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(2); // inactive
      mockPrismaService.contact.groupBy.mockResolvedValue([
        { groupName: "VIP고객" },
        { groupName: "일반고객" },
      ]);

      // Act
      const result = await service.getStats();

      // Assert
      expect(result).toEqual({
        total: 10,
        active: 8,
        inactive: 2,
        totalGroups: 2,
      });
    });
  });

  describe("bulkDelete", () => {
    it("연락처를 일괄 삭제해야 함", async () => {
      // Arrange
      const ids = ["id1", "id2", "id3"];
      mockPrismaService.contact.deleteMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await service.bulkDelete(ids);

      // Assert
      expect(result).toEqual({
        deleted: 3,
        message: "3개의 연락처가 삭제되었습니다.",
      });
      expect(mockPrismaService.contact.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
    });
  });

  describe("bulkUpdateGroup", () => {
    it("연락처 그룹을 일괄 변경해야 함", async () => {
      // Arrange
      const ids = ["id1", "id2", "id3"];
      const groupName = "VIP고객";
      mockPrismaService.contact.updateMany.mockResolvedValue({ count: 3 });

      // Act
      const result = await service.bulkUpdateGroup(ids, groupName);

      // Assert
      expect(result).toEqual({
        updated: 3,
        message: "3개의 연락처 그룹이 변경되었습니다.",
      });
      expect(mockPrismaService.contact.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data: {
          groupName,
          updatedAt: expect.any(Date),
        },
      });
    });
  });
});
