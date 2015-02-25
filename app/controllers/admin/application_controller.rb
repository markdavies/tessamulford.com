class Admin::ApplicationController < ActionController::Base

  before_filter :authenticate_admin_user!

  before_filter :always_english

  skip_before_filter :collect_categories
  skip_before_filter :force_trailing_slash
  skip_before_filter :country_redirect
  skip_before_filter :set_i18n_locale

  layout 'admin'

  def always_english
    I18n.locale = :en
  end

  def set_positions
    eval(params[:klass]).set_positions params[:positions], params[:start_index].to_i

    flash[:notices] = ["#{params[:klass]} order updated"]
    redirect_to :back
  end

  def set_position
    eval(params[:klass]).set_position params[:id].to_i, params[:position].to_i

    flash[:notices] = ["#{params[:klass]} order updated"]
    redirect_to :back    
  end

  def tag_hints

    tags = (params[:q] == '') ? [] : ActsAsTaggableOn::Tag.where("LOWER(name) LIKE '#{params[:q].downcase}%'").collect{ |t| t.name }.sort!

    respond_to do |format|
      format.json do
        render :json => { :status => :error } if !params[:q]
        render :json => { :status => :OK, :tags => tags }
      end
    end

  end

  def sublink_categories

    respond_to do |format|

      format.json do 

        cl = params[:class].constantize
        ob = cl.find(params[:id]) rescue nil

        categories = []

        if ob.class == Product
          categories << ob.material_category if ob.material_category
          categories << ob.product_type_category if ob.product_type_category

        elsif ob.class == Article
          categories << ob.category if ob.category

        end

        json = {
            :status => ob ? :OK : :ERROR,
            :categories => categories.map{|c| [c.title, c.id]}
          }

        render :json => json

      end

    end

  end

  def clear_cache
    Rails.cache.clear
  end

  protected

  def json_error errors, status=400
    render json: { errors: errors }, status: status
  end
  
end
