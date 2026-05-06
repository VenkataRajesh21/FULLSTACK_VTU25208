<?php
// ✅ CORS Headers (cleaned & corrected)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Handle preflight request properly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "localhost";
    private $db_name = "antigravity_jobs";
    private $username = "FSDA";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // ✅ Add charset (important fix)
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";

            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // Show errors
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,  // Cleaner fetch
                PDO::ATTR_EMULATE_PREPARES => false                // Security fix
            ]);

        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                "error" => "Database connection failed",
                "details" => $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>
