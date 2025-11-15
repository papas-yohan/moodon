import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CloudinaryStorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log("Cloudinary storage initialized");
    } else {
      this.logger.warn("Cloudinary credentials not found, using local storage");
    }
  }

  /**
   * 파일 업로드
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.isConfigured) {
      // Fallback to local storage
      return this.uploadToLocal(file, folder);
    }

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `moodon/${folder}`,
        resource_type: "auto",
        public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      });

      // 로컬 임시 파일 삭제
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error.message}`);
      // Fallback to local storage
      return this.uploadToLocal(file, folder);
    }
  }

  /**
   * Buffer로 파일 업로드
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<string> {
    if (!this.isConfigured) {
      return this.uploadBufferToLocal(buffer, filename, folder);
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `moodon/${folder}`,
            resource_type: "auto",
            public_id: `${Date.now()}-${filename}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              this.logger.log(
                `Buffer uploaded to Cloudinary: ${result.secure_url}`,
              );
              resolve(result.secure_url);
            }
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      this.logger.error(`Cloudinary buffer upload failed: ${error.message}`);
      return this.uploadBufferToLocal(buffer, filename, folder);
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    if (!this.isConfigured || !fileUrl.includes("cloudinary.com")) {
      return this.deleteFromLocal(fileUrl);
    }

    try {
      // Cloudinary URL에서 public_id 추출
      const publicId = this.extractPublicId(fileUrl);
      if (!publicId) {
        this.logger.warn(`Could not extract public_id from URL: ${fileUrl}`);
        return false;
      }

      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`File deleted from Cloudinary: ${publicId}`);
      return true;
    } catch (error) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Cloudinary URL에서 public_id 추출
   */
  private extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/moodon\/[^/]+\/([^.]+)/);
      return matches ? `moodon/${matches[1]}` : null;
    } catch {
      return null;
    }
  }

  /**
   * 로컬 스토리지에 업로드 (Fallback)
   */
  private uploadToLocal(file: Express.Multer.File, folder: string): string {
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    fs.copyFileSync(file.path, filepath);
    fs.unlinkSync(file.path);

    return `/uploads/${folder}/${filename}`;
  }

  /**
   * Buffer를 로컬 스토리지에 저장 (Fallback)
   */
  private uploadBufferToLocal(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): string {
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    return `/uploads/${folder}/${filename}`;
  }

  /**
   * 로컬 파일 삭제 (Fallback)
   */
  private deleteFromLocal(fileUrl: string): boolean {
    try {
      const filepath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Local file delete failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Cloudinary 설정 상태 확인
   */
  isCloudinaryConfigured(): boolean {
    return this.isConfigured;
  }
}
