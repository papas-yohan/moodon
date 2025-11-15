import { Test, TestingModule } from "@nestjs/testing";
import { ContactsController } from "./contacts.controller";
import { ContactsService } from "./contacts.service";
import {
  CreateContactDto,
  UpdateContactDto,
  QueryContactDto,
  UploadContactsDto,
} from "./dto";

describe("ContactsController", () => {
  let controller: ContactsController;
  let service: ContactsService;

  const mockContactsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadContacts: jest.fn(),
    getGroups: jest.fn(),
    getStats: jest.fn(),
    bulkDelete: jest.fn(),
    bulkUpdateGroup: jest.fn(),
    getSampleTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    service = module.get<ContactsService>(ContactsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("연락처를 생성하고 결과를 반환해야 함", async () => {
      // Arrange
      const createDto: CreateContactDto = {
        name: "홍길동",
        phone: "01012345678",
        kakaoId: "hong123",
        groupName: "VIP고객",
      };
      const expectedResult = {
        id: "contact-1",
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContactsService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("쿼리 파라미터로 연락처 목록을 조회해야 함", async () => {
      // Arrange
      const queryDto: QueryContactDto = {
        page: 1,
        limit: 10,
        search: "홍길동",
      };
      const expectedResult = {
        data: [
          { id: "1", name: "홍길동", phone: "01012345678" },
          { id: "2", name: "홍길순", phone: "01087654321" },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockContactsService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe("getStats", () => {
    it("연락처 통계를 반환해야 함", async () => {
      // Arrange
      const expectedStats = {
        total: 100,
        active: 95,
        inactive: 5,
        totalGroups: 10,
      };

      mockContactsService.getStats.mockResolvedValue(expectedStats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe("getGroups", () => {
    it("그룹 목록을 반환해야 함", async () => {
      // Arrange
      const expectedGroups = [
        { name: "VIP고객", count: 50 },
        { name: "일반고객", count: 30 },
        { name: "신규고객", count: 20 },
      ];

      mockContactsService.getGroups.mockResolvedValue(expectedGroups);

      // Act
      const result = await controller.getGroups();

      // Assert
      expect(result).toEqual(expectedGroups);
      expect(service.getGroups).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("ID로 연락처를 조회해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      const expectedResult = {
        id: contactId,
        name: "홍길동",
        phone: "01012345678",
        groupName: "VIP고객",
      };

      mockContactsService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(contactId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(contactId);
    });
  });

  describe("update", () => {
    it("연락처를 수정하고 결과를 반환해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      const updateDto: UpdateContactDto = {
        name: "수정된 이름",
        groupName: "새그룹",
      };
      const expectedResult = {
        id: contactId,
        ...updateDto,
        phone: "01012345678",
        updatedAt: new Date(),
      };

      mockContactsService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update(contactId, updateDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(contactId, updateDto);
    });
  });

  describe("remove", () => {
    it("연락처를 삭제해야 함", async () => {
      // Arrange
      const contactId = "contact-1";
      mockContactsService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(contactId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(contactId);
    });
  });

  describe("uploadContacts", () => {
    it("연락처 파일을 업로드하고 결과를 반환해야 함", async () => {
      // Arrange
      const file = {
        originalname: "contacts.xlsx",
        buffer: Buffer.from("test"),
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 1000,
      } as Express.Multer.File;
      const uploadDto: UploadContactsDto = {
        defaultGroupName: "업로드그룹",
        overwriteDuplicates: false,
        skipInvalid: true,
      };
      const expectedResult = {
        summary: {
          total: 10,
          valid: 9,
          invalid: 1,
          created: 8,
          updated: 1,
          skipped: 0,
        },
        errors: [
          {
            row: 5,
            data: { name: "잘못된데이터", phone: "잘못된번호" },
            error: "올바르지 않은 전화번호 형식입니다.",
          },
        ],
      };

      mockContactsService.uploadContacts.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.uploadContacts(file, uploadDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.uploadContacts).toHaveBeenCalledWith(file, uploadDto);
    });
  });

  describe("bulkDelete", () => {
    it("연락처를 일괄 삭제해야 함", async () => {
      // Arrange
      const ids = ["id1", "id2", "id3"];
      const expectedResult = {
        deleted: 3,
        message: "3개의 연락처가 삭제되었습니다.",
      };

      mockContactsService.bulkDelete.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.bulkDelete(ids);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.bulkDelete).toHaveBeenCalledWith(ids);
    });
  });

  describe("bulkUpdateGroup", () => {
    it("연락처 그룹을 일괄 변경해야 함", async () => {
      // Arrange
      const ids = ["id1", "id2", "id3"];
      const groupName = "VIP고객";
      const expectedResult = {
        updated: 3,
        message: "3개의 연락처 그룹이 변경되었습니다.",
      };

      mockContactsService.bulkUpdateGroup.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.bulkUpdateGroup(ids, groupName);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.bulkUpdateGroup).toHaveBeenCalledWith(ids, groupName);
    });
  });
});
