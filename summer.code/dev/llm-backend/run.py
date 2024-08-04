from app import create_app

# Create a flask app
app = create_app()

if __name__ == '__main__':
    # run in debug env
    app.run(debug=True)