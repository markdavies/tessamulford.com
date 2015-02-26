class Image < ActiveRecord::Base

  include Dimensions

  after_initialize :after_initialize

  has_attached_file :attachment, 
    :styles => lambda { |att| {
      thumb: { geometry: '200x200#' },
      large: { 
        geometry: '',
        convert_options: "-gravity north -resize 1240x -auto-orient"
      },
      medium: { 
        geometry: '',
        convert_options: "-gravity north -resize 700x -auto-orient"
      }
    }
  }

  validates_attachment_content_type :attachment, 
  content_type: [ 'image/jpg', 'image/jpeg', 'image/png' ], 
  message: 'is invalid. Only png and jpg formats are permitted'

  validates_attachment_size :attachment,
  in: 0..5.megabytes,
  message: 'is too large. Should be no larger than 5MB'

  extract_dimensions_for :attachment

  # Defines helper methods for paperclip attachments
  # @image.square_small instead of @image.attachement(:square_small)
  # Helpful when including methods in json responses
  def after_initialize
    attachment.styles.collect {|s| s[0] }.each do |style|
      class_eval do 
        define_method style do 
          attachment style
        end
      end
    end
  end

end

