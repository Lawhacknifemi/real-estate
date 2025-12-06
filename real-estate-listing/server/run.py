from app import create_app

flask_app = create_app()

if __name__ == '__main__':
    # Using port 5001 because macOS AirPlay Receiver uses port 5000 by default
    flask_app.run(debug=True, host='127.0.0.1', port=5001)
