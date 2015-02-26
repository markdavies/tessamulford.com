module AdminHelper

  def start_index
    page = params[:page] || 1
    per_page = params[:limit] || Kaminari.config.default_per_page
    per_page = per_page.to_i
    (page.to_i - 1) * per_page
  end

end