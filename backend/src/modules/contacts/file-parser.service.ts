import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

export interface ParsedContact {
  name?: string;
  phone: string;
  kakaoId?: string;
  groupName?: string;
  tags?: string;
  isActive?: boolean;
}

export interface ParseResult {
  contacts: ParsedContact[];
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  async parseFile(
    file: Express.Multer.File,
    options: {
      defaultGroupName?: string;
      skipInvalid?: boolean;
    } = {},
  ): Promise<ParseResult> {
    try {
      const { originalname, buffer, mimetype } = file;
      
      this.logger.log(`Parsing file: ${originalname}, type: ${mimetype}`);

      let rawData: any[];

      if (mimetype.includes('sheet') || originalname.endsWith('.xlsx') || originalname.endsWith('.xls')) {
        rawData = await this.parseExcel(buffer);
      } else if (mimetype.includes('csv') || originalname.endsWith('.csv')) {
        rawData = await this.parseCsv(buffer);
      } else {
        throw new BadRequestException('지원하지 않는 파일 형식입니다. (Excel, CSV만 지원)');
      }

      return this.processRawData(rawData, options);
    } catch (error) {
      this.logger.error('File parsing failed', error);
      throw error;
    }
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 헤더를 포함한 JSON 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
      });

      if (jsonData.length === 0) {
        throw new BadRequestException('빈 파일입니다.');
      }

      // 첫 번째 행을 헤더로 사용
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      return rows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      throw new BadRequestException('Excel 파일 파싱에 실패했습니다.');
    }
  }

  private async parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(new BadRequestException('CSV 파일 파싱에 실패했습니다.')));
    });
  }

  private processRawData(
    rawData: any[],
    options: {
      defaultGroupName?: string;
      skipInvalid?: boolean;
    },
  ): ParseResult {
    const contacts: ParsedContact[] = [];
    const errors: Array<{ row: number; data: any; error: string }> = [];

    rawData.forEach((row, index) => {
      try {
        const contact = this.mapRowToContact(row, options.defaultGroupName);
        const validation = this.validateContact(contact);

        if (validation.isValid) {
          contacts.push(contact);
        } else {
          errors.push({
            row: index + 2, // Excel/CSV 행 번호 (헤더 포함)
            data: row,
            error: validation.error,
          });
        }
      } catch (error) {
        errors.push({
          row: index + 2,
          data: row,
          error: error.message,
        });
      }
    });

    return {
      contacts,
      errors,
      summary: {
        total: rawData.length,
        valid: contacts.length,
        invalid: errors.length,
      },
    };
  }

  private mapRowToContact(row: any, defaultGroupName?: string): ParsedContact {
    // 다양한 헤더 형식 지원
    const phoneFields = ['phone', '전화번호', '휴대폰', '핸드폰', 'mobile', 'tel'];
    const nameFields = ['name', '이름', '성명', '고객명'];
    const kakaoFields = ['kakaoId', '카카오', '카카오ID', 'kakao', 'kakao_id'];
    const groupFields = ['groupName', '그룹', '그룹명', 'group', 'category', '카테고리'];
    const tagFields = ['tags', '태그', 'tag', 'label', '라벨'];

    const phone = this.findFieldValue(row, phoneFields);
    const name = this.findFieldValue(row, nameFields);
    const kakaoId = this.findFieldValue(row, kakaoFields);
    const groupName = this.findFieldValue(row, groupFields) || defaultGroupName;
    const tags = this.findFieldValue(row, tagFields);

    return {
      phone: this.normalizePhone(phone),
      name: name || undefined,
      kakaoId: kakaoId || undefined,
      groupName: groupName || undefined,
      tags: tags || undefined,
      isActive: true,
    };
  }

  private findFieldValue(row: any, possibleFields: string[]): string {
    for (const field of possibleFields) {
      // 대소문자 구분 없이 검색
      const key = Object.keys(row).find(k => 
        k.toLowerCase() === field.toLowerCase()
      );
      if (key && row[key]) {
        return String(row[key]).trim();
      }
    }
    return '';
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');
    
    // 한국 전화번호 형식 확인 및 정규화
    if (numbers.length === 11 && numbers.startsWith('010')) {
      return numbers;
    } else if (numbers.length === 10 && numbers.startsWith('10')) {
      return '0' + numbers;
    }
    
    return numbers;
  }

  private validateContact(contact: ParsedContact): { isValid: boolean; error?: string } {
    // 전화번호 필수 체크
    if (!contact.phone) {
      return { isValid: false, error: '전화번호가 없습니다.' };
    }

    // 전화번호 형식 체크
    const phoneRegex = /^010\d{8}$/;
    if (!phoneRegex.test(contact.phone)) {
      return { isValid: false, error: '올바르지 않은 전화번호 형식입니다.' };
    }

    // 이름 길이 체크
    if (contact.name && contact.name.length > 50) {
      return { isValid: false, error: '이름이 너무 깁니다. (최대 50자)' };
    }

    // 카카오 ID 길이 체크
    if (contact.kakaoId && contact.kakaoId.length > 100) {
      return { isValid: false, error: '카카오 ID가 너무 깁니다. (최대 100자)' };
    }

    return { isValid: true };
  }

  // 샘플 템플릿 생성
  generateSampleTemplate(): Buffer {
    const sampleData = [
      ['이름', '전화번호', '카카오ID', '그룹명', '태그'],
      ['홍길동', '01012345678', 'hong123', 'VIP고객', '신규고객,20대'],
      ['김영희', '01087654321', 'kim456', '일반고객', '기존고객,30대'],
      ['이철수', '01055556666', '', 'VIP고객', '재구매고객'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '주소록');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}