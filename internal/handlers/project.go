package handlers

import (
	"chapiteau/internal/models"
	"chapiteau/internal/repository"
	"net/http"

	"errors"

	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	Repo repository.Repository
}

func NewProjectHandler(repo repository.Repository) ProjectHandler {
	return ProjectHandler{Repo: repo}
}

type ProjectInput struct {
	Name string `json:"name" binding:"required"`
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var input ProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := getUserIDFromContext(c)

	project := &models.Project{
		ID:   generateUUID(),
		Name: input.Name,
	}

	relation := &models.UserProject{
		ID:        generateUUID(),
		ProjectID: project.ID,
		UserID:    userID,
		IsAdmin:   true,
	}

	if err := h.Repo.Project.CreateProject(project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create project"})
		return
	}

	if err := h.Repo.Project.CreateUserProject(relation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to link project to user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"project": project})
}

func (h *ProjectHandler) currentUserIsAdmin(c *gin.Context, projectID string) error {
	hasProject, isAdmin, err := h.Repo.Project.AvailableFor(getUserIDFromContext(c), projectID)
	if err != nil {
		return err
	}

	if isApiKey(c) || !hasProject || !isAdmin {
		return errors.New("you are not the owner of the project")
	}

	return nil
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	projectID := c.Param("id")
	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var input ProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project, err := h.Repo.Project.GetProject(projectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch project"})
		return
	}

	project.Name = input.Name

	if err := h.Repo.Project.UpdateProject(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"project": input})
}

func (h *ProjectHandler) GetProjects(c *gin.Context) {
	userID := getUserIDFromContext(c)

	relations, err := h.Repo.Project.GetUserProjects(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch projects"})
		return
	}

	projectIds := make([]string, len(relations))
	for index, relation := range relations {
		projectIds[index] = relation.ProjectID
	}

	projects, err := h.Repo.Project.GetProjectsByIDs(projectIds)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func (h *ProjectHandler) GetProjectUsers(c *gin.Context) {
	projectID := c.Param("id")

	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	userProjects, err := h.Repo.Project.GetProjectUsers(projectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch project users"})
		return
	}

	users := make([]*models.User, len(userProjects))
	for index, userProject := range userProjects {
		user, err := h.Repo.User.GetUserByID(userProject.UserID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch user"})
			return
		}
		users[index] = user
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	projectID := c.Param("id")

	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	//TODO
	//trx := h.Repo.DB.Begin()

	if err := h.Repo.Project.DeleteUserProject(getUserIDFromContext(c), projectID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete user project relation"})
		return
	}

	if err := h.Repo.Project.DeleteProject(projectID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

func (h *ProjectHandler) InviteUser(c *gin.Context) {
	projectID := c.Param("id")
	var input struct {
		Username string `json:"username" binding:"required"`
		IsAdmin  bool   `json:"is_admin"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	user, err := h.Repo.User.GetUserByUsername(input.Username)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	relation := &models.UserProject{
		ID:        generateUUID(),
		ProjectID: projectID,
		UserID:    user.ID,
		IsAdmin:   input.IsAdmin,
	}

	if err := h.Repo.Project.CreateUserProject(relation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to invite user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User invited successfully"})
}

func (h *ProjectHandler) SetProjectOwner(c *gin.Context) {
	projectID := c.Param("id")

	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		Username string `json:"username" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.Repo.User.GetUserByUsername(input.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	relation, err := h.Repo.Project.GetUserProject(user.ID, projectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to fetch user project relation"})
		return
	}

	if relation.IsAdmin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is already an admin"})
		return
	}

	relation.IsAdmin = true

	if err := h.Repo.Project.UpdateUserProject(&relation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to set project owner"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project owner set successfully"})
}

func (h *ProjectHandler) RemoveProjectOwner(c *gin.Context) {
	projectID := c.Param("id")
	userID := c.Param("userId")

	if err := h.currentUserIsAdmin(c, projectID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	user, err := h.Repo.User.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	relation, err := h.Repo.Project.GetUserProject(user.ID, projectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to check if user is owner"})
		return
	}

	if !relation.IsAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "User is not the owner of the project"})
		return
	}

	relation.IsAdmin = false

	if err := h.Repo.Project.UpdateUserProject(&relation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to remove project owner"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project owner removed successfully"})
}
