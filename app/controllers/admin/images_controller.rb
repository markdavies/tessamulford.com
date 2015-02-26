class Admin::ImagesController < Admin::ApplicationController

  add_breadcrumb 'Images', :admin_images_path

  def index
    @images = Image.all.page(params[:page] || 1)
  end

  def new 
    @image = Image.new
    add_breadcrumb "New"
  end

  def create
    @image = Image.new
    @image.image_type = params[:type] if params[:type]
    @image.update_attributes image_params

    if @image.save
      respond_to do |format|
        format.json do
          render json: @image, 
          methods: show_methods,
          except: except_show_methods
        end
        format.html do
          redirect_to params[:edit] ? edit_admin_image_path(@image) : admin_images_path          
        end
      end   
    else
      respond_to do |format|
        format.json { json_error @image.errors.full_messages }
        format.html do 
          flash.now[:errors] = @image.errors.full_messages
          render action: 'edit'
        end
      end
    end
  end

  def edit
    @image = Image.find(params[:id])
    add_breadcrumb @image.id, edit_admin_image_path(@image)    
  end

  def show
    @image = Image.find params[:id]
    redirect_to edit_admin_image_path(@image)
  end

  def update
    @image = Image.find(params[:id])
    if @image.update_attributes(image_params)
      redirect_to params[:edit] ? edit_admin_image_path(@image) : admin_images_path
    else
      flash.now[:errors] = @image.errors.full_messages
      render action: 'edit'
    end
  end

  def destroy
    @image = Image.find params[:id]
    if @image.destroy
      redirect_to admin_images_path
    else
      flash.now[:errors] = @image.errors.full_messages
      render action: 'edit'
    end
  end
 
  private 

  def image_params
    params.require(:image).permit(:attachment)
  end

  def show_methods
    [ :thumb, :small, :large, :attachment_width, :attachment_height ]
  end

  def except_show_methods
    [ :created_at, :updated_at, :grid_item_id,
      :attachment_file_name, :attachment_content_type, 
      :attachment_file_size, :attachment_updated_at,
      :attachment_dimensions ]
  end

end
