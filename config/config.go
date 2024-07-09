package config

import "github.com/spf13/viper"

type Config struct {
	DatabaseURL          string `mapstructure:"DATABASE_URL"`
	JWTSecret            string `mapstructure:"JWT_SECRET"`
	AppHost              string `mapstructure:"API_HOST"`
	AppPort              string `mapstructure:"API_PORT"`
	DisabledRegistration bool   `mapstructure:"DISABLED_REGISTRATION"`
	FQDN                 string `mapstructure:"FQDN"`
}

func LoadConfig() (Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		return Config{}, err
	}

	var config Config
	err = viper.Unmarshal(&config)
	return config, err
}
