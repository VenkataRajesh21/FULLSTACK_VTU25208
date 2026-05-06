<?php
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    if (isset($_GET['seeker_id'])) {
        // Get applications for a seeker
        $query = "SELECT a.*, j.title, p.company_name FROM applications a 
                  JOIN jobs j ON a.job_id = j.id 
                  JOIN profiles_employer p ON j.employer_id = p.user_id 
                  WHERE a.seeker_id = :seeker_id ORDER BY a.applied_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':seeker_id', $_GET['seeker_id']);
    } elseif (isset($_GET['employer_id'])) {
        // Get applications for an employer's jobs
        $query = "SELECT a.*, j.title, p.full_name as applicant_name, p.resume_url 
                  FROM applications a 
                  JOIN jobs j ON a.job_id = j.id 
                  JOIN profiles_seeker p ON a.seeker_id = p.user_id 
                  WHERE j.employer_id = :employer_id ORDER BY a.applied_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':employer_id', $_GET['employer_id']);
    } else {
        echo json_encode(["error" => "Specify seeker_id or employer_id"]);
        exit();
    }
    
    $stmt->execute();
    $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($apps);

} elseif ($method == 'POST') {
    // Apply for a job
    if (isset($_GET['action']) && $_GET['action'] == 'update_status') {
        // Update application status (Employer action)
        if (!empty($_POST['application_id']) && !empty($_POST['status'])) {
            $query = "UPDATE applications SET status = :status WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':status', $_POST['status']);
            $stmt->bindParam(':id', $_POST['application_id']);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Application status updated."]);
            } else {
                echo json_encode(["error" => "Unable to update status."]);
            }
        } else {
            echo json_encode(["error" => "Incomplete data."]);
        }
    } else {
        // New Application (Seeker action)
        if (!empty($_POST['job_id']) && !empty($_POST['seeker_id'])) {
            try {
                $query = "INSERT INTO applications (job_id, seeker_id) VALUES (:job_id, :seeker_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':job_id', $_POST['job_id']);
                $stmt->bindParam(':seeker_id', $_POST['seeker_id']);
                
                if ($stmt->execute()) {
                    echo json_encode(["message" => "Applied successfully.", "id" => $db->lastInsertId()]);
                } else {
                    echo json_encode(["error" => "Unable to apply."]);
                }
            } catch (PDOException $e) {
                echo json_encode(["error" => "Already applied to this job or database error."]);
            }
        } else {
            echo json_encode(["error" => "Incomplete data."]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit();
}
?>
