class Page < ActiveRecord::Base

  before_save :set_slug

  validates_presence_of :title
  validates_uniqueness_of :title

  default_scope { order(title: :desc) }

  def set_slug
    self.slug = title.parameterize
  end

end
