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
    post 'position' => 'application#set_position', as: :set_position
    post 'positions' => 'application#set_positions', as: :set_positions

    resources :images, except: [:create, :update] do
      with_scope_level(:create) do
        post '(:type)/images(.:format)', to: 'images#create'
        patch '(:type)/images/:id(.:format)', to: 'images#update'
      end
    end

    resources :projects, param: :slug
    resources :pages, only: [:index, :edit, :update], param: :slug

  end
  
end
