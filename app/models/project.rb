class Project < ActiveRecord::Base

  validates_presence_of :title, :feature, :body
  validates_uniqueness_of :title

  before_save :set_slug

  def set_slug
    self.slug = title.parameterize
  end

end
