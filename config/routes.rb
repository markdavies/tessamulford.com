Rails.application.routes.draw do
  
  devise_for :admin_users, 
    controllers: { sessions: "admin/sessions" }, 
    path: 'admin', 
    path_names: { 
      sign_in: 'login', 
      sign_out: 'logout' 
    }

  namespace :admin do 

    root 'projects#index'

    resources :projects

  end
  
end
