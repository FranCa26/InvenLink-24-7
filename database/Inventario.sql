-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.5.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para inventario
CREATE DATABASE IF NOT EXISTS `inventario` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `inventario`;

-- Volcando estructura para tabla inventario.detalles_entrada
CREATE TABLE IF NOT EXISTS `detalles_entrada` (
  `Id_Detalle` bigint(20) NOT NULL AUTO_INCREMENT,
  `Id_Entrada` bigint(20) NOT NULL,
  `Cod_Producto` varchar(20) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id_Detalle`),
  KEY `Id_Entrada` (`Id_Entrada`),
  KEY `Cod_Producto` (`Cod_Producto`),
  CONSTRAINT `detalles_entrada_ibfk_1` FOREIGN KEY (`Id_Entrada`) REFERENCES `entradas` (`Id_Entrada`),
  CONSTRAINT `detalles_entrada_ibfk_2` FOREIGN KEY (`Cod_Producto`) REFERENCES `productos` (`Cod_Producto`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla inventario.detalles_venta
CREATE TABLE IF NOT EXISTS `detalles_venta` (
  `Id_Detalle` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Venta` int(11) NOT NULL,
  `Cod_Producto` varchar(20) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio_Unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Id_Detalle`),
  KEY `FK_detalles_venta_ventas` (`Id_Venta`),
  KEY `FK_detalles_venta_productos` (`Cod_Producto`),
  KEY `idx_detalles_venta_producto` (`Cod_Producto`),
  CONSTRAINT `FK_detalles_venta_productos` FOREIGN KEY (`Cod_Producto`) REFERENCES `productos` (`Cod_Producto`),
  CONSTRAINT `FK_detalles_venta_ventas` FOREIGN KEY (`Id_Venta`) REFERENCES `ventas` (`Id_Venta`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla inventario.entradas
CREATE TABLE IF NOT EXISTS `entradas` (
  `Id_Entrada` bigint(20) NOT NULL AUTO_INCREMENT,
  `Fecha` datetime NOT NULL,
  `Proveedor` varchar(100) NOT NULL,
  `Numero_Factura` varchar(50) DEFAULT NULL,
  `Total` decimal(10,2) NOT NULL,
  `Observaciones` text DEFAULT NULL,
  PRIMARY KEY (`Id_Entrada`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla inventario.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `Cod_Producto` varchar(20) NOT NULL,
  `Nombre` varchar(255) NOT NULL,
  `Marca` varchar(100) NOT NULL,
  `Talle` varchar(50) DEFAULT NULL,
  `Categoria` varchar(100) NOT NULL,
  `Stock_Inicial` int(11) NOT NULL,
  `Stock_Actual` int(11) NOT NULL,
  `Prec_Costo` decimal(10,2) NOT NULL,
  `Prec_Venta` decimal(10,2) NOT NULL,
  `Estado` enum('Disponible','Agotado') GENERATED ALWAYS AS (case when `Stock_Actual` > 0 then 'Disponible' else 'Agotado' end) STORED,
  PRIMARY KEY (`Cod_Producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla inventario.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `Id_Usuario` bigint(20) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Rol` enum('admin','vendedor') NOT NULL DEFAULT 'vendedor',
  `Fecha_Creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Id_Usuario`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla inventario.ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `Id_Venta` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `Nombre_Cliente` varchar(100) DEFAULT 'Cliente General',
  `Total` decimal(10,2) NOT NULL,
  `Metodo_Pago` varchar(50) DEFAULT 'Efectivo',
  `Observaciones` text DEFAULT NULL,
  PRIMARY KEY (`Id_Venta`),
  KEY `idx_ventas_fecha` (`Fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
