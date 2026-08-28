-- BikeApp MySQL / phpMyAdmin schema
-- Import this in phpMyAdmin, then set DATABASE_URL to a mysql:// connection
-- and change prisma/schema.prisma provider to "mysql".

CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `role` ENUM('CUSTOMER', 'MECHANIC', 'ADMIN') NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key` (`email`)
);

CREATE TABLE `Customer` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `lat` DOUBLE NULL,
  `lng` DOUBLE NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Customer_userId_key` (`userId`),
  CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Mechanic` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `specialty` VARCHAR(191) NULL,
  `experienceYears` INT NOT NULL DEFAULT 0,
  `rating` DOUBLE NOT NULL DEFAULT 0,
  `reviewCount` INT NOT NULL DEFAULT 0,
  `lat` DOUBLE NULL,
  `lng` DOUBLE NULL,
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Mechanic_userId_key` (`userId`),
  CONSTRAINT `Mechanic_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Admin` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Admin_userId_key` (`userId`),
  CONSTRAINT `Admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Bike` (
  `id` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `brand` VARCHAR(191) NOT NULL,
  `model` VARCHAR(191) NOT NULL,
  `year` INT NULL,
  `registration` VARCHAR(191) NULL,
  `color` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Bike_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Service` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `basePrice` DOUBLE NOT NULL,
  `priceMin` DOUBLE NOT NULL DEFAULT 0,
  `priceMax` DOUBLE NOT NULL DEFAULT 0,
  `durationMin` INT NOT NULL,
  -- BikeListing also stores `meetingPoint` VARCHAR(191), `lat` DOUBLE, `lng` DOUBLE
  PRIMARY KEY (`id`)
);

CREATE TABLE `Booking` (
  `id` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `mechanicId` VARCHAR(191) NULL,
  `bikeId` VARCHAR(191) NOT NULL,
  `serviceId` VARCHAR(191) NOT NULL,
  `mode` ENUM('DOORSTEP', 'PICKUP_DROP') NOT NULL,
  `scheduledAt` DATETIME(3) NOT NULL,
  `status` ENUM('REQUESTED', 'CONFIRMED', 'MECHANIC_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  `address` VARCHAR(191) NOT NULL,
  `lat` DOUBLE NULL,
  `lng` DOUBLE NULL,
  `estimatedPrice` DOUBLE NOT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Booking_mechanicId_fkey` FOREIGN KEY (`mechanicId`) REFERENCES `Mechanic` (`id`),
  CONSTRAINT `Booking_bikeId_fkey` FOREIGN KEY (`bikeId`) REFERENCES `Bike` (`id`),
  CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`)
);

CREATE TABLE `StatusLog` (
  `id` VARCHAR(191) NOT NULL,
  `bookingId` VARCHAR(191) NOT NULL,
  `status` ENUM('REQUESTED', 'CONFIRMED', 'MECHANIC_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL,
  `note` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `StatusLog_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Payment` (
  `id` VARCHAR(191) NOT NULL,
  `bookingId` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `status` ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `method` VARCHAR(191) NULL,
  `paidAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Payment_bookingId_key` (`bookingId`),
  CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Review` (
  `id` VARCHAR(191) NOT NULL,
  `bookingId` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `mechanicId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Review_bookingId_key` (`bookingId`),
  CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_mechanicId_fkey` FOREIGN KEY (`mechanicId`) REFERENCES `Mechanic` (`id`)
);
