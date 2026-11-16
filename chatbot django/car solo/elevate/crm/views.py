from django.shortcuts import render, redirect
from django.http import JsonResponse

from . forms import CreateUserForm, LoginForm

from django.contrib.auth.decorators import login_required


# - Authentication models and functions

from django.contrib.auth.models import auth
from django.contrib.auth import authenticate, login, logout

from .models import ChatMessage


def homepage(request):

    return render(request, 'crm/index.html')




def register(request):
    form = CreateUserForm()
    if request.method == "POST":
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("my-login")
    context = {'registerform':form}
    return render(request, 'crm/signup.html', context=context)



def my_login(request):
    form = LoginForm()
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth.login(request, user)
                return redirect("dashboard")
    context = {'loginform':form}
    return render(request, 'crm/login.html', context=context)


def user_logout(request):
    auth.logout(request)

    return redirect("")



@login_required(login_url="my-login")
def dashboard(request):

    return render(request, 'crm/dashboard.html')

@login_required(login_url="my-login")
def model3D (request):

    return render(request, 'crm/3D model.html')

@login_required(login_url="my-login")
def send_chat_message(request):
    if request.method == 'POST':
        message = request.POST.get('message', '')
        model_used = request.POST.get('model', 'gemini')  # Default to gemini if not specified
        
        # Process the message and get a response
        # This is where you would integrate with your AI chatbot
        response = f"Echo: {message}"
        
        # Save the message and response to the database
        ChatMessage.objects.create(
            user=request.user,
            message=message,
            response=response,
            model_used=model_used
        )
        
        return JsonResponse({'response': response})
    return JsonResponse({'error': 'Invalid request'}, status=400)









