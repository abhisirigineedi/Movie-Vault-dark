import pytest

@pytest.fixture(scope="module")
def auth_client(client):
    # Register and login a user
    client.post("/api/auth/register", json={"username": "movieuser", "password": "password"})
    response = client.post("/api/auth/login", json={"username": "movieuser", "password": "password"})
    
    # Check that access_token cookie is automatically handled by TestClient for subsequent requests
    return client

def test_create_movie(auth_client):
    response = auth_client.post(
        "/api/movies/",
        json={"name": "Inception", "genre": "Sci-Fi", "year": 2010, "rating": 5.0}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Inception"
    assert "id" in data

def test_get_movies(auth_client):
    response = auth_client.get("/api/movies/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Inception"

def test_update_movie(auth_client):
    # First get the movies
    movies_res = auth_client.get("/api/movies/")
    movie_id = movies_res.json()[0]["id"]

    response = auth_client.put(
        f"/api/movies/{movie_id}",
        json={"name": "Inception (Updated)", "genre": "Sci-Fi Action", "year": 2010, "rating": 4.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Inception (Updated)"
    assert data["rating"] == 4.5

def test_delete_movie(auth_client):
    movies_res = auth_client.get("/api/movies/")
    movie_id = movies_res.json()[0]["id"]

    response = auth_client.delete(f"/api/movies/{movie_id}")
    assert response.status_code == 204

    # Verify deletion
    movies_res_after = auth_client.get("/api/movies/")
    assert len(movies_res_after.json()) == 0
