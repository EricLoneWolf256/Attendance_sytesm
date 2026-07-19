-- AlterTable
ALTER TABLE `courses` ADD COLUMN `lecturerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `courses_lecturerId_idx` ON `courses`(`lecturerId`);

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `lecturer_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
