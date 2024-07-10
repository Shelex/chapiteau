package repository

import (
	"os"
	"path/filepath"
)

type ReportsStorage struct {
	Root string
}

func NewReportsStorage() ReportsStorage {
	return ReportsStorage{
		Root: "reports",
	}
}

func (r *ReportsStorage) GetPath(fragments ...string) string {
	return filepath.Join(fragments...)
}

func (r *ReportsStorage) DeleteProjectReports(projectID string) error {
	err := os.RemoveAll(r.GetPath(r.Root, projectID))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

func (r *ReportsStorage) DeleteRunReport(projectID, runID string) error {
	err := os.RemoveAll(filepath.Join(r.Root, projectID, runID))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
