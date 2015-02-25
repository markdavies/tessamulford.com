
if ENV['SEED_ADMIN_EMAIL'] && ENV['SEED_ADMIN_PASSWORD']
  AdminUser.create email: ENV['SEED_ADMIN_EMAIL'], 
  password: ENV['SEED_ADMIN_PASSWORD']
end