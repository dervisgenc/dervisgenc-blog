package config

import (
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

// Config struct for application configuration
type Config struct {
	Port        string
	LogOutput   string
	LogFilePath string
	DBHost      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBPort      string
	JWTSecret   []byte
	Image       ImageConfig
}

type ImageConfig struct {
	StoragePath  string
	MaxSizeMB    int
	AllowedTypes []string
	BaseURL      string
	Quality      int
	MaxWidth     int
	MaxHeight    int
	StorageType  string // "local" or potentially "s3", "gcs" etc.
}

// Loads the configuration from environment variables end returns a Config struct
func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Couldn't find .env file, default values will be loaded: %v", err)
	}

	return &Config{
		Port:        getEnv("PORT", ":8080"),
		LogOutput:   getEnv("LOG_OUTPUT", "file"), //default olarak file seçilmiştir
		LogFilePath: getEnv("LOG_FILE_PATH", getDefaultLogPath()),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBUser:      getEnv("DB_USER", "dervis"),
		DBPassword:  getEnv("DB_PASSWORD", "12461246"),
		DBName:      getEnv("DB_NAME", "website"),
		DBPort:      getEnv("DB_PORT", "5433"),
		JWTSecret:   []byte(getEnv("JWT_SECRET", "secret-key")),
		Image: ImageConfig{
			StoragePath:  "uploads/images",
			MaxSizeMB:    5,
			AllowedTypes: []string{"image/jpeg", "image/png", "image/webp"},
			BaseURL:      "http://localhost:8080/uploads/images",
			Quality:      85,
			MaxWidth:     1920,
			MaxHeight:    1080,
			StorageType:  "local", // Default storage type
		},
	}
}

// return value from env or default value
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// Set up logger based on config
func SetupLogger(cfg *Config) *logrus.Logger {
	log := logrus.New()

	log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	if cfg.LogOutput == "file" {
		file, err := os.OpenFile(cfg.LogFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

		if err != nil {
			log.Fatalf("Cannot open log file: %v", err)
		}

		log.SetOutput(file)

	} else {
		log.SetOutput(os.Stdout)
	}

	log.SetLevel(logrus.InfoLevel) // Default log level is Debug
	return log
}

// return default log path based on OS
func getDefaultLogPath() string {
	osType := runtime.GOOS
	var logPath string

	switch osType {
	case "linux":
		logPath = "/var/log/website.log"
	case "windows":
		programData := os.Getenv("PROGRAMDATA")
		if programData == "" {
			programData = "C:\\ProgramData" // default path
		}
		logPath = filepath.Join(programData, "BeeHub", "beehub.log")
	case "darwin": //Default for mac
		logPath = "/usr/local/var/log/beehub.log"
	default:
		logPath = "./beehub.log" // Unknown OS
	}

	return logPath
}
