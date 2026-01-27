import redshift_connector


class RedshiftConnection:
    def __init__(self, host, database, port, user, password, timeout=15):
        self.host = host
        self.database = database
        self.port = port
        self.user = user
        self.password = password
        self.timeout = timeout  # Increased connection timeout
        self.connection = None
        self.cursor = None

    def connect(self):
        """Establish a connection with timeout and retry handling"""
        try:
            self.connection = redshift_connector.connect(
                host=self.host,
                database=self.database,
                port=self.port,
                user=self.user,
                password=self.password,
                timeout=self.timeout  # Add connection timeout
            )
            self.connection.autocommit = True
            self.cursor = self.connection.cursor()
            return self.connection
        except Exception as e:
            print(f"Connection error: {e}")
            raise

    def execute_query(self, query, params=None):
        """Execute query with existing connection"""
        try:
            # Ensure connection exists
            if not self.connection:
                self.connect()

            # Execute query
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)

            # Return results for SELECT queries
            if query.strip().upper().startswith("SELECT"):
                return self.cursor.fetchall()
            return self.cursor.rowcount  # Return affected rows for INSERT/UPDATE

        except Exception as e:
            print(f"Query error: {e}")
            # Reset connection on error
            self.close()
            raise

    def execute_batch(self, query, params_list):
        """Execute batch of parameters using redshift_connector"""
        try:
            if not self.connection:
                self.connect()

            self.cursor.executemany(query, params_list)
            self.connection.commit()
            return len(params_list)  # Return number of executed items

        except Exception as e:
            print(f"Batch execution error: {e}")
            self.close()
            raise

    def close(self):
        """Properly close connection"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection:
                self.connection.close()
        except Exception as e:
            print(f"Error closing connection: {e}")
        finally:
            self.connection = None
            self.cursor = None
