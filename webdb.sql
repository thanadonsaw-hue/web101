-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Mar 15, 2026 at 06:17 PM
-- Server version: 8.4.8
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `created_at`) VALUES
(1, 1, 30140.00, 'cancelled', '2026-03-15 10:31:01'),
(2, 1, 2990.00, 'cancelled', '2026-03-15 10:37:18'),
(3, 1, 4590.00, 'cancelled', '2026-03-15 10:38:20'),
(4, 2, 47920.00, 'completed', '2026-03-15 11:21:19'),
(5, 1, 22070.00, 'cancelled', '2026-03-15 14:33:13'),
(6, 1, 13470.00, 'cancelled', '2026-03-15 14:33:25'),
(7, 4, 77700.00, 'completed', '2026-03-15 14:38:48'),
(8, 1, 8900.00, 'shipped', '2026-03-15 15:49:09'),
(9, 4, 27150.00, 'shipped', '2026-03-15 15:50:28'),
(10, 4, 9180.00, 'completed', '2026-03-15 16:38:09'),
(11, 4, 8580.00, 'completed', '2026-03-15 18:12:05'),
(12, 4, 2500.00, 'pending', '2026-03-15 18:13:19'),
(13, 4, 1250.00, 'pending', '2026-03-15 18:13:28');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 7, 1, 1250.00),
(2, 1, 6, 1, 25900.00),
(3, 1, 4, 1, 2990.00),
(4, 2, 4, 1, 2990.00),
(5, 3, 2, 1, 4590.00),
(6, 4, 1, 1, 8900.00),
(7, 4, 2, 1, 4590.00),
(8, 4, 3, 1, 4290.00),
(9, 4, 4, 1, 2990.00),
(10, 4, 6, 1, 25900.00),
(11, 4, 7, 1, 1250.00),
(12, 5, 3, 2, 4290.00),
(13, 5, 2, 1, 4590.00),
(14, 5, 1, 1, 8900.00),
(15, 6, 2, 2, 4590.00),
(16, 6, 3, 1, 4290.00),
(17, 7, 6, 3, 25900.00),
(18, 8, 1, 1, 8900.00),
(19, 9, 6, 1, 25900.00),
(20, 9, 7, 1, 1250.00),
(21, 10, 2, 2, 4590.00),
(22, 11, 3, 2, 4290.00),
(23, 12, 7, 2, 1250.00),
(24, 13, 7, 1, 1250.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image_url` varchar(255) DEFAULT 'Logo(2).png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `stock`, `image_url`) VALUES
(1, 'LG UltraGear 27 นิ้ว 144Hz', 8900.00, 0, '1773567064667.jpg'),
(2, 'Logitech G Pro X Superlight', 4590.00, 13, '1773567615269.jpg'),
(3, 'Keychron K8 Pro Wireless', 4290.00, 4, '1773570457860.jpg'),
(4, 'HyperX Cloud II', 2990.00, 9, '1773570568997.jpg'),
(6, 'GALAX GEFORCE RTX 5070 EX GAMER 1-CLICK OC 12GB ', 25900.00, 3, '1773566150209.jpg'),
(7, 'Ajazz AJ159P', 1250.00, 9, '1773566027316.jpg'),
(8, 'MSI THIN 15 B13VE-1608TH (COSMOS GRAY)', 28990.00, 10, '1773589582036.jpg'),
(9, 'GIGABYTE GEFORCE RTX 5070 GAMING OC 12G', 25990.00, 5, '1773589681331.jpg'),
(10, 'GIGABYTE GEFORCE RTX 5070 GAMING OC 12G', 25990.00, 4, '1773589730045.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `firstname`, `lastname`, `role`) VALUES
(1, 'admin', 'admin123', 'Super', 'Admin', 'admin'),
(2, 'testuser', '123456', 'Somchai', 'Jaidee', 'user'),
(3, 'TanZ4826', 'password', 'Tan', 'Z', 'user'),
(4, 'TenZ', 'asd12345', 'Sentinal', 'TenZ', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
