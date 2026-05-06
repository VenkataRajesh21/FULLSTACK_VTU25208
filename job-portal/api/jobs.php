<?php
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // List jobs
    if (isset($_GET['employer_id'])) {
        // Jobs for a specific employer
        $query = "SELECT j.*, p.company_name FROM jobs j LEFT JOIN profiles_employer p ON j.employer_id = p.user_id WHERE j.employer_id = :employer_id ORDER BY j.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':employer_id', $_GET['employer_id']);
    } else {
        // All open jobs
        $query = "SELECT j.*, p.company_name FROM jobs j LEFT JOIN profiles_employer p ON j.employer_id = p.user_id WHERE j.status = 'open' ORDER BY j.created_at DESC";
        $stmt = $db->prepare($query);
    }
    
    $stmt->execute();
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($jobs);

} elseif ($method == 'POST') {
    // Create a job
    if (!empty($_POST['employer_id']) && !empty($_POST['title']) && !empty($_POST['description'])) {
        $query = "INSERT INTO jobs (employer_id, title, description, requirements, location) VALUES (:employer_id, :title, :description, :requirements, :location)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':employer_id', $_POST['employer_id']);
        $stmt->bindParam(':title', $_POST['title']);
        $stmt->bindParam(':description', $_POST['description']);
        $req = isset($_POST['requirements']) ? $_POST['requirements'] : '';
        $loc = isset($_POST['location']) ? $_POST['location'] : '';
        $stmt->bindParam(':requirements', $req);
        $stmt->bindParam(':location', $loc);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Job created successfully.", "id" => $db->lastInsertId()]);
        } else {
            echo json_encode(["error" => "Unable to create job."]);
        }
    } else {
        echo json_encode(["error" => "Incomplete data."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit();
}
?>
