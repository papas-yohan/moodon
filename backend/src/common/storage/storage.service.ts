import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v2 as cloudinary } from "cloudinary";
import * as sharp from "sharp";
import * as path from "path";
import * as fs from "fs/promises";

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly useS3: boolean;
  private readonly useCloudinary: boolean;
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    const useS3Env = this.configService.get<string>("USE_S3");
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET") || "";
    this.useS3 = useS3Env === "true";
    this.uploadDir =
      this.configService.get<string>("UPLOAD_DIR") || "./uploads";

    // Cloudinary 설정 확인
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");
    this.useCloudinary = !!(cloudName && apiKey && apiSecret);

    this.logger.log(
      `Storage configuration: USE_S3=${this.useS3}, useCloudinary=${this.useCloudinary}, uploadDir=${this.uploadDir}`,
    );

    if (this.useCloudinary) {
      this.initializeCloudinary();
    } else if (this.useS3) {
      this.initializeS3();
    } else {
      this.initializeLocalStorage();
    }
  }

  private initializeCloudinary() {
    try {
      cloudinary.config({
        cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
        api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
        api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
      });
      this.logger.log("Cloudinary storage initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Cloudinary", error);
      throw error;
    }
  }

  private initializeS3() {
    try {
      this.s3Client = new S3Client({
        region:
          this.configService.get<string>("AWS_REGION") || "ap-northeast-2",
        credentials: {
          accessKeyId:
            this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
          secretAccessKey:
            this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
        },
      });
      this.logger.log("S3 client initialized");
    } catch (error) {
      this.logger.error("Failed to initialize S3 client", error);
      throw error;
    }
  }

  private async initializeLocalStorage() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, "products"), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.uploadDir, "composed"), {
        recursive: true,
      });
      this.logger.log(`Local storage initialized at ${this.uploadDir}`);
    } catch (error) {
      this.logger.error("Failed to initialize local storage", error);
      throw error;
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = "products",
    options?: {
      resize?: { width: number; height: number };
      quality?: number;
    },
  ): Promise<UploadResult> {
    try {
      // 이미지 전처리
      let processedBuffer = file.buffer;
      const mimeType = file.mimetype;

      // 버퍼가 비어있는지 확인
      if (!file.buffer || file.buffer.length === 0) {
        throw new Error("업로드된 파일이 비어있습니다.");
      }

      if (options?.resize || options?.quality) {
        try {
          const sharpInstance = sharp(file.buffer);

          if (options.resize) {
            sharpInstance.resize(options.resize.width, options.resize.height, {
              fit: "inside",
              withoutEnlargement: true,
            });
          }

          if (options.quality && file.mimetype.includes("jpeg")) {
            sharpInstance.jpeg({ quality: options.quality });
          } else if (options.quality && file.mimetype.includes("png")) {
            sharpInstance.png({ quality: options.quality });
          }

          processedBuffer = await sharpInstance.toBuffer();
        } catch (sharpError) {
          this.logger.error(
            "Sharp processing failed, using original buffer",
            sharpError,
          );
          // Sharp 처리 실패 시 원본 버퍼 사용
          processedBuffer = file.buffer;
        }
      }

      const fileName = this.generateFileName(file.originalname);
      const key = `${folder}/${fileName}`;

      if (this.useCloudinary) {
        return await this.uploadToCloudinary(processedBuffer, key, mimeType);
      } else if (this.useS3) {
        return await this.uploadToS3(processedBuffer, key, mimeType);
      } else {
        return await this.uploadToLocal(processedBuffer, key, mimeType);
      }
    } catch (error) {
      this.logger.error("Failed to upload image", error);
      throw error;
    }
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    try {
      // Buffer를 base64로 변환하여 업로드
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;
      
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: "moodon",
        public_id: key.replace(/\//g, "_"), // 슬래시를 언더스코어로 변경
        resource_type: "auto",
      });

      this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);

      return {
        url: result.secure_url,
        key: result.public_id,
        size: buffer.length,
        mimeType,
      };
    } catch (error) {
      this.logger.error("Failed to upload to Cloudinary", error);
      throw error;
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: "public-read",
    });

    await this.s3Client.send(command);

    const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    return {
      url,
      key,
      size: buffer.length,
      mimeType,
    };
  }

  private async uploadToLocal(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    // 디렉토리 생성
    await fs.mkdir(dir, { recursive: true });

    // 파일 저장
    await fs.writeFile(filePath, buffer);

    // 상대 경로로 URL 생성 (프록시를 통해 접근)
    const url = `/uploads/${key}`;

    return {
      url,
      key,
      size: buffer.length,
      mimeType,
    };
  }

  async deleteImage(key: string): Promise<void> {
    try {
      if (this.useCloudinary) {
        await this.deleteFromCloudinary(key);
      } else if (this.useS3) {
        await this.deleteFromS3(key);
      } else {
        await this.deleteFromLocal(key);
      }
    } catch (error) {
      this.logger.error(`Failed to delete image: ${key}`, error);
      throw error;
    }
  }

  private async deleteFromCloudinary(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
      this.logger.log(`Deleted from Cloudinary: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from Cloudinary: ${key}`, error);
      throw error;
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error("S3 client not initialized");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 파일이 존재하지 않는 경우 무시
      if ((error as any).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.useS3 || !this.s3Client) {
      // 로컬 스토리지의 경우 직접 URL 반환
      const baseUrl =
        this.configService.get<string>("BASE_URL") || "http://localhost:3000";
      return `${baseUrl}/uploads/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const ext = path.extname(originalName);
    return `${timestamp}-${random}${ext}`;
  }

  // 이미지 정보 조회
  async getImageInfo(buffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: buffer.length,
    };
  }
}
