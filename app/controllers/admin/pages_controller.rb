class Admin::PagesController < Admin::ApplicationController

  def index
    @pages = Page.all
  end

  def edit
    @page = Page.find_by_slug params[:slug]
    add_breadcrumb @page.title.titleize, edit_admin_page_path(@page)
  end

  def update
    @page = Page.find_by_slug params[:slug]

    if @page.update_attributes(page_params)
      clear_cache
      redirect_to params[:edit] ? edit_admin_page_path(@page) : admin_pages_path
    else
      flash.now[:errors] = @page.errors.full_messages
      render action: 'edit'
    end
  end
  
  private

  def page_params
    params.require(:page).permit(:title, :content, :sidebar)
  end

end