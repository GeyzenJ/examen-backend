-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema WebProject
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `WebProject` DEFAULT CHARACTER SET utf8 ;
USE `WebProject` ;

-- -----------------------------------------------------
-- Table `WebProject`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `WebProject`.`Users` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Admin` TINYINT NULL,
  `Name` VARCHAR(100) NULL,
  `First_Name` VARCHAR(100) NULL,
  `Mail` VARCHAR(100) NULL,
  `Password` VARCHAR(100) NULL,
  PRIMARY KEY (`IDcampings`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `WebProject`.`Campings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `WebProject`.`Campings` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Naam` VARCHAR(100) NULL,
  `Plaats_Electriciteit` INT NULL,
  `Plaats_Zonder_Electriciteit` INT NULL,
  `Zwembad` TINYINT NULL,
  `Speeltuin` TINYINT NULL,
  `Animatie` TINYINT NULL,
  `Straatnaam` VARCHAR(100) NULL,
  `Huisnummer` VARCHAR(100) NULL,
  `Postcode` VARCHAR(100) NULL,
  `Gemeente` VARCHAR(100) NULL,
  `Land` VARCHAR(100) NULL,
  `Bescrijving` VARCHAR(10000) NULL,
  `User_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `User_ID`),
  INDEX `fk_Camping_User1_idx` (`User_ID` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `WebProject`.`Boekingen`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `WebProject`.`Boekingen` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Start_Datum` DATE NULL,
  `Eind_Datum` DATE NULL,
  `Electriciteit` TINYINT NULL,
  `User_ID` INT NOT NULL,
  `Camping_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `User_ID`, `Camping_ID`),
  INDEX `fk_Boekingen_User1_idx` (`User_ID` ASC) VISIBLE,
  INDEX `fk_Boekingen_Camping1_idx` (`Camping_ID` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `WebProject`.`Ratings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `WebProject`.`Ratings` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Score` INT NULL,
  `Beschrijving` VARCHAR(500) NULL,
  `User_ID` INT NOT NULL,
  `Camping_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `User_ID`, `Camping_ID`),
  INDEX `fk_Rating_User1_idx` (`User_ID` ASC) VISIBLE,
  INDEX `fk_Rating_Camping1_idx` (`Camping_ID` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `WebProject`.`Fotos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `WebProject`.`Fotos` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Pad` VARCHAR(250) NULL,
  `Camping_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `Camping_ID`),
  INDEX `fk_Foto_Camping1_idx` (`Camping_ID` ASC) VISIBLE)
ENGINE = InnoDB;

-- SET SQL_MODE=@OLD_SQL_MODE;
-- SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
-- SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;



-- Insert dummy data into Users table
INSERT INTO `WebProject`.`Users` (`Admin`, `Name`, `First_Name`, `Mail`, `Password`) VALUES
(1, 'Doe', 'John', 'admin@camping1.com', 'admin'),
(0, 'Smith', 'Jane', 'jane.smith@example.com', 'pass'),
(0, 'Brown', 'Charlie', 'charlie.brown@example.com', 'pass');

-- Insert dummy data into Campings table
INSERT INTO `WebProject`.`Campings` (`Naam`, `Plaats_Electriciteit`, `Plaats_Zonder_Electriciteit`, `Zwembad`, `Speeltuin`, `Animatie`, `Straatnaam`, `Huisnummer`, `Postcode`, `Gemeente`, `Land`, `Bescrijving`, `User_ID`) VALUES
("Zilvermeer', 10, 5, 1, 1, 1, 'Postelsesteenweg', '71', '2400', 'Mol', 'België', 'Beautiful camping site with all amenities.', 1),
('Camping Bohan', 15, 10, 0, 1, 0, 'Rue de Mont les Champs', '214', '5550', 'Bohan sur Semois', 'Belgïe', 'Quiet camping site with a playground.', 1),
('Urban Gardens Ieper', 20, 15, 1, 0, 1, 'Bolwerkstraat', '1', '8900', 'Ieper', 'België', 'Large camping site with a pool and animation.', 1);

-- Insert dummy data into Boekingen table
INSERT INTO `WebProject`.`Boekingen` (`Start_Datum`, `Eind_Datum`, `Electriciteit`, `User_ID`, `Camping_ID`) VALUES
('2025-06-01', '2025-06-10', 1, 3, 1),
('2025-07-15', '2025-07-20', 0, 2, 2),
('2025-08-05', '2025-08-15', 1, 3, 3);

-- Insert dummy data into Ratings table
INSERT INTO `WebProject`.`Ratings` (`Score`, `Beschrijving`, `User_ID`, `Camping_ID`) VALUES
(5, 'Amazing experience!', 2, 1),
(4, 'Very good, but could be better.', 2, 2),
(3, 'Average experience.', 3, 3);
