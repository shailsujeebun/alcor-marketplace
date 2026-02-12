import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('s3.endpoint')!;
    const region = this.configService.get<string>('s3.region')!;
    const accessKeyId = this.configService.get<string>('s3.accessKeyId')!;
    const secretAccessKey =
      this.configService.get<string>('s3.secretAccessKey')!;

    this.bucket = this.configService.get<string>('s3.bucket')!;
    this.publicUrl = this.configService.get<string>('s3.publicUrl')!;

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" exists`);
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`);
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" created`);
      } catch (err) {
        this.logger.warn(
          `Could not create bucket: ${err}. Will retry on first upload.`,
        );
      }
    }

    // Ensure public read access for uploaded assets
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.s3.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`Bucket "${this.bucket}" policy set to public-read`);
    } catch (err) {
      this.logger.warn(`Could not set public policy: ${err}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getPresignedUrl(
    folder: string = 'images',
    contentType: string = 'image/jpeg',
  ) {
    const ext = contentType.split('/')[1] ?? 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return {
      uploadUrl: url,
      key,
      publicUrl: `${this.publicUrl}/${key}`,
    };
  }
}
