/*
  Warnings:

  - The primary key for the `gecourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The values [A1,A2,A3,B1,B2,B3,B4,UPPER_DIVISION_B,C1,C2,UPPER_DIVISION_C,D1,D2,UPPER_DIVISION_D,E,F] on the enum `GECourse_category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `termWinter` on the `termtypicallyoffered` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gecourse` DROP PRIMARY KEY,
    MODIFY `category` ENUM('GE_1A', 'GE_1B', 'GE_1C', 'GE_5A', 'GE_5B', 'GE_5C', 'GE_2', 'UPPER_DIVISION_2_5', 'GE_3A', 'GE_3B', 'UPPER_DIVISION_3', 'GE_4A', 'GE_4B', 'UPPER_DIVISION_4', 'GE_6') NOT NULL,
    ADD PRIMARY KEY (`category`, `id`, `catalog`);

-- AlterTable
ALTER TABLE `termtypicallyoffered` DROP COLUMN `termWinter`;
