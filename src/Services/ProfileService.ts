import { ProfileRepository } from "../Repositories/ProfileRepository";
import { editValidate, editImage } from "../validations/ProfileValidate";
import { throwCustomError } from "../utils/errorHandling";
import { tempImage } from "../config/configPath"; // Importing folder paths
import { ImageRepository } from "../Repositories/ImageRepository";
import fs from "fs";
import path from "path";

export class ProfileService {
  private profileRepository: ProfileRepository;
  private imageRepository: ImageRepository;

  constructor(
    profileRepository: ProfileRepository,
    imageRepository: ImageRepository
  ) {
    this.profileRepository = profileRepository;
    this.imageRepository = imageRepository;
  }
  async create(userId: number, transaction: any) {
    try {
      const profile = await this.profileRepository.create(userId, transaction);
      return profile;
    } catch (error) {
      console.log(error);
    }
  }

  async editValidate(userId: number, authUserId: number, data: any) {
    if (userId !== authUserId) {
      throwCustomError("شما اجازه  بروز رسانی این پروفایل را ندارید", 400);
    }
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throwCustomError("پروفایلی یافت نشد", 404);
    }
    const { error } = await editValidate.validate(data);
    if (error) {
      throwCustomError(error.details[0].message, 400);
    }
  }

  async edit(data: any, userId: number) {
    await this.profileRepository.edit(data, userId);
  }
  async validateImage(imageName: string) {
    const { error } = await editImage.validate({ imageName });
    if (error) {
      throwCustomError(error.details[0].message, 400);
    }

    const tempImagePath = path.join(tempImage, imageName);

    if (!fs.existsSync(tempImagePath)) {
      throwCustomError("عکسی یافت نشد", 400);
    }
  }

  async moveImage(imageName: string, userId: number, profile: any) {
    const profileDataArray = Array.isArray(profile) ? profile : [profile];
    const image = profileDataArray["0"].image;
    const profileId = profileDataArray["0"].id;
    const destinationFolderPath = path.join(tempImage, userId.toString());
    const imagePath = path.join(tempImage, imageName);
    const destinationFilePath = path.join(destinationFolderPath, imageName);

    if (!fs.existsSync(destinationFolderPath)) {
      fs.mkdirSync(destinationFolderPath);
      fs.rename(imagePath, destinationFilePath, (err) => {
        if (err) {
          console.error(`Error moving ${imageName} to user folder:`, err);
        } else {
        }
      });

      return await this.imageRepository.create(imageName, profileId);
    } else {
      if (image) {
        const imageUrl = image.url;
        fs.rename(imagePath, destinationFilePath, (err) => {
          if (err) {
            console.error(`Error moving ${imageName} to user folder:`, err);
          } else {
          }
        });
        const oldImagePath = path.join(destinationFolderPath, imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(`Error deleting original image ${imageName}:`, err);
          } else {
          }
        });

        return await this.imageRepository.update(imageName, profileId);
      }
    }
  }

  async findImageByUserId(userId: number) {
    return await this.profileRepository.findImageByUserId(userId);
  }

  async deleteImage(profile: any, userId: number) {
    const profileDataArray = Array.isArray(profile) ? profile : [profile];
    const image = profileDataArray["0"].image;

    if (!image) {
      throwCustomError("عکسی یافت نشد", 400);
    } else {
      const imageName = image.url;
      const destinationFolderPath = path.join(tempImage, userId.toString());
      const destinationFilePath = path.join(destinationFolderPath, imageName);
      if (!destinationFilePath) {
        throwCustomError("عکسی یافت نشد", 400);
      } else {
        fs.unlink(destinationFilePath, (err) => {
          if (err) {
            console.error(`Error deleting original image ${imageName}:`, err);
          } else {
          }
        });
      }
      if (!destinationFolderPath) {
        throwCustomError("در حذف فولدر مشکلی پیش امده", 400);
      } else {
        fs.rmdir(destinationFolderPath, { recursive: true }, (err) => {
          if (err) {
            console.error(`Error removing folder: ${err}`);
          } else {
            console.log("Folder removed successfully");
          }
        });
      }
    }
    await this.imageRepository.deleteImage(image);
  }
}
