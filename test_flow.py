import httpx

BASE_URL = "http://127.0.0.1:8000/api"

def run_test():
    with httpx.Client() as session:
        print("--- Starting End-to-End Test ---")
        
        # 1. Create a user
        import time
        username = f"movie_fan_{int(time.time())}"
        print(f"\n[1] Creating user: {username}")
        res = session.post(f"{BASE_URL}/auth/register", json={
            "username": username,
            "password": "secure_password"
        })
        
        if res.status_code == 201:
            print(" -> Success! User created:", res.json()["username"])
        else:
            print(" -> Failed!", res.status_code, res.text)
            return

        # 2. Login
        print("\n[2] Logging into account")
        res = session.post(f"{BASE_URL}/auth/login", json={
            "username": username,
            "password": "secure_password"
        })
        
        if res.status_code == 200:
            print(" -> Success! Logged in securely. Cookies set:", session.cookies)
        else:
            print(" -> Failed!", res.status_code, res.text)
            return

        # 3. Check Auth Status
        res = session.get(f"{BASE_URL}/auth/check")
        print(f"\n[3] Auth check validation: {res.json()}")

        # 4. Add Movie
        print("\n[4] Adding movie to wishlist")
        movie_payload = {
            "name": "Interstellar",
            "genre": "Sci-Fi",
            "year": 2014,
            "rating": 5.0
        }
        res = session.post(f"{BASE_URL}/movies/", json=movie_payload)
        
        if res.status_code == 201:
            print(" -> Success! Movie added:", res.json())
        else:
            print(" -> Failed!", res.status_code, res.text)
            return
            
        # 5. Get Movies List
        print("\n[5] Fetching dashboard movies")
        res = session.get(f"{BASE_URL}/movies/")
        movies = res.json()
        print(f" -> Success! Total movies found: {len(movies)}")
        print(" -> Dashboard movie titles:", [m["name"] for m in movies])

        print("\n--- All Tests Passed Successfully! ---")

if __name__ == "__main__":
    run_test()
