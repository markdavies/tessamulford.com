class Admin::ProjectsController < Admin::ApplicationController

  def new
    @project = Project.new
  end

  def create
    @project = Project.new project_params

    if @project.save
      clear_cache
      redirect_to params[:edit] ? 
      edit_admin_project_path(@project) : admin_projects_path
    else
      flash.now[:errors] = @project.errors.full_messages
      render action: 'new'
    end
  end

  def index       
    @projects = Project.all
  end

  def edit
    @project = Project.find_by_slug params[:slug]
    add_breadcrumb @project.title.titleize, edit_admin_project_path(@project)
  end

  def update
    @project = Project.find_by_slug params[:slug]

    if @project.update_attributes(project_params)
      clear_cache
      redirect_to params[:edit] ? edit_admin_project_path(@project) : admin_projects_path
    else
      flash.now[:errors] = @project.errors.full_messages
      render action: 'edit'
    end
  end

  def destroy
    @project = Project.find_by_slug params[:slug]
    if @project.destroy
      redirect_to admin_projects_path
    else
      flash.now[:errors] = @project.errors.full_messages
      render action: 'edit'
    end
  end
  
  private

  def project_params
    params.require(:project).permit(:title, :description, :credits, :url, :feature, :body, :status)
  end

end