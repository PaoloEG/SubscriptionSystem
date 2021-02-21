db.createUser(
    {
        user: "subscriptionservice",
        pwd: "securepassword",
        roles: [
            {
                role: "readWrite",
                db: "subscription-service"
            }
        ]
    }
);