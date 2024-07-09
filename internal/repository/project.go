package repository

import (
	"chapiteau/internal/models"

	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return ProjectRepository{
		db: db,
	}
}

func (r *ProjectRepository) CreateProject(project *models.Project) error {
	return r.db.Create(project).Error
}

func (r *ProjectRepository) UpdateProject(project *models.Project) error {
	return r.db.Save(project).Error
}

func (r *ProjectRepository) DeleteProject(id string) error {
	return r.db.Delete(&models.Project{}, "id = ?", id).Error
}

func (r *ProjectRepository) GetProject(projectId string) (models.Project, error) {
	var project models.Project
	err := r.db.Where("id = ?", projectId).Find(&project).Error
	return project, err
}

func (r *ProjectRepository) GetProjectsByIDs(ids []string) ([]models.Project, error) {
	projects := make([]models.Project, len(ids))
	for i, id := range ids {
		p, err := r.GetProject(id)
		if err != nil {
			return nil, err
		}
		projects[i] = p
	}
	return projects, nil
}

func (r *ProjectRepository) CreateUserProject(userProject *models.UserProject) error {
	return r.db.Create(userProject).Error
}

func (r *ProjectRepository) GetProjectUsers(projectID string) ([]models.UserProject, error) {
	var userProjects []models.UserProject
	err := r.db.Where("project_id = ?", projectID).Find(&userProjects).Error
	return userProjects, err
}

func (r *ProjectRepository) DeleteUserProject(userID, projectID string) error {
	return r.db.Where("user_id = ? AND project_id = ?", userID, projectID).Delete(&models.UserProject{}).Error
}

func (r *ProjectRepository) UpdateUserProject(userProject *models.UserProject) error {
	return r.db.Save(userProject).Error
}

func (r *ProjectRepository) GetUserProject(userID, projectID string) (models.UserProject, error) {
	var relation models.UserProject
	err := r.db.First(&relation, "user_id = ? AND project_id = ?", userID, projectID).Error
	return relation, err
}

func (r *ProjectRepository) GetUserProjects(userID string) ([]models.UserProject, error) {
	var relations []models.UserProject
	err := r.db.Find(&relations, "user_id = ?", userID).Error
	return relations, err
}

func (r *ProjectRepository) AvailableForUser(userID, projectID string) (isAvailable bool, isOwner bool, err error) {
	relation, err := r.GetUserProject(userID, projectID)
	if err != nil {
		return false, false, err
	}
	return relation.ID != "", relation.IsAdmin, nil
}
