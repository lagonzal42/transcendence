from django.contrib.auth import login, authenticate
from django.views.generic import TemplateView, CreateView
from django.urls import reverse_lazy
from .forms import SignUpForm


class IndexView(TemplateView):
    """ Main view """
    template_name = "index.html"


class SignupView(CreateView):
    """ View for user registration """
    form_class = SignUpForm # Set up the registration form you created
    template_name = "accounts/signup.html" 
    success_url = reverse_lazy("accounts:index") # Page to redirect to after user creation

    def form_valid(self, form):
        # Setting to keep users logged in after they are created
        response = super().form_valid(form)
        account_id = form.cleaned_data.get("account_id")
        password = form.cleaned_data.get("password1")
        user = authenticate(account_id=account_id, password=password)
        login(self.request, user)
        return response
