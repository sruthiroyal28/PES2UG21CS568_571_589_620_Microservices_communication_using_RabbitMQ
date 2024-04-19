import mysql.connector

def connect_to_database():
    try:
        # Establish connection to the MySQL server without specifying a database
        connection = mysql.connector.connect(
            host="localhost",
            port=3306,  # Specify the port separately
            user="root",  # Replace with your MySQL username
            password="jacksonwang123$$"  # Replace with your MySQL password
        )
        
        cursor = connection.cursor()
        
        # Check if the database 'inventory' exists
        cursor.execute("SHOW DATABASES LIKE 'inventory'")
        result = cursor.fetchone()
        
        if not result:
            # Create the 'inventory' database if it doesn't exist
            cursor.execute("CREATE DATABASE inventory")
            print("Database 'inventory' created")
            
        # Connect to the 'inventory' database
        connection.database = 'inventory'
        print("Connected to the database")
        
        return connection
        
    except mysql.connector.Error as error:
        print("Error connecting to the database:", error)
        return None

def create_tables(connection):
    cursor = connection.cursor()
    try:
        # Create item table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS item (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL
            )
        """)
        
        # Create stock table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock (
                stock_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                quantity INT NOT NULL,
                location VARCHAR(100),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (item_id) REFERENCES item(item_id)
            )
        """)
        
        # Create orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_amount DECIMAL(10, 2) NOT NULL
            )
        """)
        
        print("Tables created successfully")
        
    except mysql.connector.Error as error:
        print("Error creating tables:", error)
    finally:
        cursor.close()

def stock_management_consumer():
    # Connect to the database
    connection = connect_to_database()
    if connection is None:
        return
    
    # Create tables if they don't exist
    create_tables(connection)
    
    # Close the database connection
    connection.close()
    print("Connection to the database closed")

if __name__ == "__main__":
    stock_management_consumer()
