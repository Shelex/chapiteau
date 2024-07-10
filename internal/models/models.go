package models

import (
	"time"
)

type User struct {
	ID       string `json:"id" swaggerignore:"true" gorm:"type:uuid;primaryKey"`
	Username string `json:"username" validate:"required,min=4,max=32" gorm:"uniqueIndex;not null"`
	Password string `json:"password" validate:"required,min=3,max=32" gorm:"not null"`
}

type UserProject struct {
	ID        string `gorm:"type:uuid;primaryKey"`
	UserID    string `gorm:"type:uuid;not null"`
	ProjectID string `gorm:"type:uuid;not null"`
	IsAdmin   bool   `gorm:"default:false;not null"`
}

type Project struct {
	ID   string `gorm:"type:uuid;primaryKey"`
	Name string `gorm:"not null"`
}

type ApiKey struct {
	ID       string `gorm:"type:uuid;primaryKey"`
	UserID   string `gorm:"type:uuid;not null"`
	Name     string `gorm:"not null"`
	ExpireAt int64  `gorm:"not null"`
}

type Run struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID  string    `gorm:"type:uuid;not null" json:"projectId"`
	Workers    int64     `gorm:"default:0" json:"workers"`
	StartedAt  time.Time `gorm:"not null" json:"startedAt"`
	FinishedAt time.Time `gorm:"not null" json:"finishedAt"`
	Duration   int64     `gorm:"default:0;not null" json:"duration"`
	CreatedAt  time.Time `gorm:"not null" json:"createdAt"`
	CreatedBy  string    `gorm:"not null" json:"createdBy"`
	ReportURL  string    `json:"reportUrl"`
	BuildName  string    `json:"buildName"`
	BuildURL   string    `json:"buildUrl"`
	Total      int64     `gorm:"default:0;not null" json:"total"`
	Expected   int64     `gorm:"default:0;not null" json:"expected"`
	Unexpected int64     `gorm:"default:0;not null" json:"unexpected"`
	Flaky      int64     `gorm:"default:0;not null" json:"flaky"`
	Skipped    int64     `gorm:"default:0;not null" json:"skipped"`
	Ok         bool      `gorm:"default:false;not null" json:"ok"`
}

type File struct {
	ID         string `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID  string `gorm:"type:uuid;not null" json:"projectId"`
	RunID      string `gorm:"type:uuid;not null" json:"runId"`
	Name       string `json:"name"`
	FileID     string `json:"fileId"`
	Total      int64  `gorm:"default:0;not null" json:"total"`
	Expected   int64  `gorm:"default:0;not null" json:"expected"`
	Unexpected int64  `gorm:"default:0;not null" json:"unexpected"`
	Flaky      int64  `gorm:"default:0;not null" json:"flaky"`
	Skipped    int64  `gorm:"default:0;not null" json:"skipped"`
	Ok         bool   `gorm:"default:false;not null" json:"ok"`
}

type Test struct {
	ID            string `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID     string `gorm:"type:uuid;not null" json:"projectId"`
	RunID         string `gorm:"type:uuid;not null" json:"runId"`
	FileID        string `gorm:"type:uuid;not null" json:"fileId"`
	Location      string `json:"location"`
	TestID        string `json:"testId"`
	Title         string `json:"title"`
	PwProjectName string `json:"pwProjectName"`
	Duration      int64  `gorm:"default:0;not null" json:"duration"`
	Outcome       string `gorm:"not null" json:"outcome"`
	Path          string `gorm:"not null" json:"path"`
}

type TestAttachment struct {
	ID          string `gorm:"type:uuid;primaryKey" json:"id"`
	ProjectID   string `gorm:"type:uuid;not null" json:"projectId"`
	RunID       string `gorm:"type:uuid;not null" json:"runId"`
	TestID      string `gorm:"type:uuid;not null" json:"testId"`
	Attempt     int64  `gorm:"default:0;not null" json:"attempt"`
	Name        string `json:"name"`
	ContentType string `json:"contentType"`
	Path        string `json:"path"`
}
