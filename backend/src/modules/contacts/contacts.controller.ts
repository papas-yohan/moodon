import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, QueryContactDto, UploadContactsDto } from './dto';
import { Contact } from './entities/contact.entity';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: '연락처 등록' })
  @ApiResponse({
    status: 201,
    description: '연락처가 성공적으로 등록되었습니다.',
    type: Contact,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터 또는 중복된 전화번호' })
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: '연락처 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '연락처 목록이 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Contact' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (이름, 전화번호)' })
  @ApiQuery({ name: 'groupName', required: false, description: '그룹명 필터' })
  @ApiQuery({ name: 'isActive', required: false, description: '활성 상태 필터' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (예: createdAt:desc)' })
  async findAll(@Query() queryDto: QueryContactDto) {
    return this.contactsService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '연락처 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '연락처 통계가 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '전체 연락처 수' },
        active: { type: 'number', description: '활성 연락처 수' },
        inactive: { type: 'number', description: '비활성 연락처 수' },
        totalGroups: { type: 'number', description: '전체 그룹 수' },
      },
    },
  })
  async getStats() {
    return this.contactsService.getStats();
  }

  @Get('groups')
  @ApiOperation({ summary: '그룹 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '그룹 목록이 성공적으로 조회되었습니다.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '그룹명' },
          count: { type: 'number', description: '그룹 내 연락처 수' },
        },
      },
    },
  })
  async getGroups() {
    return this.contactsService.getGroups();
  }

  @Get('template')
  @ApiOperation({ summary: '업로드 템플릿 다운로드' })
  @ApiResponse({
    status: 200,
    description: '템플릿 파일이 성공적으로 다운로드되었습니다.',
  })
  async downloadTemplate(@Res() res: Response) {
    const template = this.contactsService.getSampleTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="contact_template.xlsx"');
    
    return res.send(template);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '연락처 파일 업로드 (Excel/CSV)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 Excel 또는 CSV 파일',
        },
        defaultGroupName: {
          type: 'string',
          description: '기본 그룹명',
          example: '업로드그룹',
        },
        overwriteDuplicates: {
          type: 'boolean',
          description: '중복 연락처 덮어쓰기 여부',
          example: false,
        },
        skipInvalid: {
          type: 'boolean',
          description: '유효하지 않은 데이터 건너뛰기 여부',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일 업로드가 성공적으로 완료되었습니다.',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number', description: '전체 행 수' },
            valid: { type: 'number', description: '유효한 데이터 수' },
            invalid: { type: 'number', description: '유효하지 않은 데이터 수' },
            created: { type: 'number', description: '생성된 연락처 수' },
            updated: { type: 'number', description: '업데이트된 연락처 수' },
            skipped: { type: 'number', description: '건너뛴 연락처 수' },
          },
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number', description: '행 번호' },
              data: { type: 'object', description: '원본 데이터' },
              error: { type: 'string', description: '에러 메시지' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 파일 형식 또는 데이터' })
  async uploadContacts(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDto: UploadContactsDto,
  ) {
    return this.contactsService.uploadContacts(file, uploadDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '연락처 상세 조회' })
  @ApiParam({ name: 'id', description: '연락처 ID' })
  @ApiResponse({
    status: 200,
    description: '연락처가 성공적으로 조회되었습니다.',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: '연락처를 찾을 수 없습니다.' })
  async findOne(@Param('id') id: string): Promise<Contact> {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '연락처 수정' })
  @ApiParam({ name: 'id', description: '연락처 ID' })
  @ApiResponse({
    status: 200,
    description: '연락처가 성공적으로 수정되었습니다.',
    type: Contact,
  })
  @ApiResponse({ status: 404, description: '연락처를 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '연락처 삭제' })
  @ApiParam({ name: 'id', description: '연락처 ID' })
  @ApiResponse({ status: 204, description: '연락처가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '연락처를 찾을 수 없습니다.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.contactsService.remove(id);
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: '연락처 일괄 삭제' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: '삭제할 연락처 ID 배열',
          example: ['id1', 'id2', 'id3'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '연락처가 성공적으로 일괄 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', description: '삭제된 연락처 수' },
        message: { type: 'string', description: '결과 메시지' },
      },
    },
  })
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.contactsService.bulkDelete(ids);
  }

  @Post('bulk/group')
  @ApiOperation({ summary: '연락처 일괄 그룹 변경' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: '변경할 연락처 ID 배열',
          example: ['id1', 'id2', 'id3'],
        },
        groupName: {
          type: 'string',
          description: '새 그룹명',
          example: 'VIP고객',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '연락처 그룹이 성공적으로 일괄 변경되었습니다.',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', description: '업데이트된 연락처 수' },
        message: { type: 'string', description: '결과 메시지' },
      },
    },
  })
  async bulkUpdateGroup(
    @Body('ids') ids: string[],
    @Body('groupName') groupName: string,
  ) {
    return this.contactsService.bulkUpdateGroup(ids, groupName);
  }
}