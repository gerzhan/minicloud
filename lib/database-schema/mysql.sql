DROP TABLE IF EXISTS `miniyun_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_id` varchar(32) NOT NULL,
  `client_secret` varchar(32) NOT NULL,
  `redirect_uri` varchar(200) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_clients`
--

LOCK TABLES `miniyun_clients` WRITE;
/*!40000 ALTER TABLE `miniyun_clients` DISABLE KEYS */;
INSERT INTO `miniyun_clients` VALUES (1,-1,'网页版','JsQCsjF3yr7KACyT','bqGeM4Yrjs3tncJZ','',1,'迷你云网页版','2015-05-03 19:45:28','2015-05-03 19:45:28'),(2,-1,'PC客户端','d6n6Hy8CtSFEVqNh','e6yvZuKEBZQe9TdA','',1,'PC客户端','2015-05-03 19:45:28','2015-05-03 19:45:28'),(3,-1,'Mac PC客户端','c9Sxzc47pnmavzfy','9ZQ4bsxEjBntFyXN','',1,'Mac PC客户端','2015-05-03 19:45:28','2015-05-03 19:45:28'),(4,-1,'Android客户端','MsUEu69sHtcDDeCp','5ABU5XPzsR6tTxeK','',1,'Android客户端','2015-05-03 19:45:28','2015-05-03 19:45:28'),(5,-1,'Linux PC客户端','V8G9svK8VDzezLum','waACXBybj9QXhE3a','',1,'Linux PC客户端','2015-05-03 19:45:28','2015-05-03 19:45:28'),(7,-1,'iPad客户端','Lt7hPcA6nuX38FY4','vV2RpBsZBE4pNGG2','',1,'iPad客户端','2015-05-03 19:45:28','2015-05-03 19:45:28'),(8,-1,'MiniyunTest','c1d8132456e5d2eef452','c988b0cc440c5dcde2d39e4d47d0baf4','',1,'MiniyunTest','2015-05-03 19:45:28','2015-05-03 19:45:28'),(100,-1,'MiniyunPlugin','JsQCsjF3yr7KACy1','bqGeM4Yrjs3tncJ1','',1,'迷你云插件使用到的应用','2015-05-03 19:45:29','2015-05-03 19:45:29');
/*!40000 ALTER TABLE `miniyun_clients` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `miniyun_group_relations`
--

DROP TABLE IF EXISTS `miniyun_group_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_group_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `parent_group_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `group_relation_group_id` (`group_id`),
  KEY `group_relation_par_group_id` (`parent_group_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_group_relations`
--

LOCK TABLES `miniyun_group_relations` WRITE;
/*!40000 ALTER TABLE `miniyun_group_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `miniyun_group_relations` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `miniyun_groups`
--

DROP TABLE IF EXISTS `miniyun_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT '-1',
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `parent_group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_groups`
--

LOCK TABLES `miniyun_groups` WRITE;
/*!40000 ALTER TABLE `miniyun_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `miniyun_groups` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `miniyun_user_devices`
--

DROP TABLE IF EXISTS `miniyun_user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_user_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_device_uuid` varchar(32) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_device_type` int(11) NOT NULL,
  `user_device_name` varchar(255) NOT NULL,
  `user_device_info` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_device_device_uuid` (`user_device_uuid`),
  KEY `user_device_user_id` (`user_id`),
  KEY `user_device_user_id_and_type` (`user_id`,`user_device_type`),
  KEY `user_device_user_id_and_type_uuid` (`user_id`,`user_device_type`,`user_device_uuid`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_user_devices`
--

LOCK TABLES `miniyun_user_devices` WRITE;
/*!40000 ALTER TABLE `miniyun_user_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `miniyun_user_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miniyun_user_devices_metas`
--

DROP TABLE IF EXISTS `miniyun_user_devices_metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_user_devices_metas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `meta_name` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `device_id_meta_name` (`device_id`,`meta_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_user_devices_metas`
--

LOCK TABLES `miniyun_user_devices_metas` WRITE;
/*!40000 ALTER TABLE `miniyun_user_devices_metas` DISABLE KEYS */;
/*!40000 ALTER TABLE `miniyun_user_devices_metas` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `miniyun_user_group_relations`
--

DROP TABLE IF EXISTS `miniyun_user_group_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_user_group_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_group_relation_user_id` (`user_id`),
  KEY `user_group_relation_group_id` (`group_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_user_group_relations`
--

LOCK TABLES `miniyun_user_group_relations` WRITE;
/*!40000 ALTER TABLE `miniyun_user_group_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `miniyun_user_group_relations` ENABLE KEYS */;
UNLOCK TABLES;
--
-- Table structure for table `miniyun_user_metas`
--

DROP TABLE IF EXISTS `miniyun_user_metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_user_metas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `meta_key` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_user_metas`
--

LOCK TABLES `miniyun_user_metas` WRITE;
/*!40000 ALTER TABLE `miniyun_user_metas` DISABLE KEYS */;
INSERT INTO `miniyun_user_metas` VALUES (1,1,'is_admin','1','2015-05-03 19:45:28','2015-05-03 19:45:28');
/*!40000 ALTER TABLE `miniyun_user_metas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miniyun_users`
--

DROP TABLE IF EXISTS `miniyun_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `miniyun_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_uuid` varchar(32) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_pass` varchar(255) NOT NULL,
  `user_status` tinyint(1) NOT NULL DEFAULT '1',
  `salt` char(6) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_name_pinyin` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_name`),
  KEY `user_uuid` (`user_uuid`),
  KEY `miniyun_usrs_user_name_pinyin` (`user_name_pinyin`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miniyun_users`
--

LOCK TABLES `miniyun_users` WRITE;
/*!40000 ALTER TABLE `miniyun_users` DISABLE KEYS */;
INSERT INTO `miniyun_users` VALUES (1,'55460a59363be','admin','c193b9d3364581d390937ded675e06e3',1,'FeW2wY','2015-05-03 19:45:28','2015-05-03 22:37:04','admin|admin|hujiedao|hjd');
/*!40000 ALTER TABLE `miniyun_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_tokens`
--

DROP TABLE IF EXISTS `oauth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_access_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(64) NOT NULL,
  `client_id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Table structure for table `oauth_refresh_tokens`
--

DROP TABLE IF EXISTS `oauth_refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(64) NOT NULL,
  `client_id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_refresh_tokens`
--

LOCK TABLES `oauth_refresh_tokens` WRITE;
/*!40000 ALTER TABLE `oauth_refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;
