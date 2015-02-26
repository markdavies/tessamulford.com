
if ENV['SEED_ADMIN_EMAIL'] && ENV['SEED_ADMIN_PASSWORD']
  AdminUser.create email: ENV['SEED_ADMIN_EMAIL'], 
  password: ENV['SEED_ADMIN_PASSWORD']
end

about = Page.find_by_slug('about')
if !about
  about = Page.new({title: 'About'})
  about.save
end

contact = Page.find_by_slug('contact')
if !contact
  contact = Page.new({title: 'Contact'})
  contact.save
end