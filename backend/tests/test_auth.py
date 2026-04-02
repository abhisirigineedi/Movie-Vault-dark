def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_register_duplicate_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 400

def test_login_user(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies

def test_login_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
