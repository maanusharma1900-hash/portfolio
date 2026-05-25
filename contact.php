<?php
/**
 * contact.php — Contact Form Handler
 * Receives POST data from the portfolio contact form,
 * validates it, sanitizes it, and saves it to MySQL.
 *
 * Place this file in the same directory as index.html.
 *
 * CONFIGURATION: Edit the DB_* constants below to match your MySQL setup.
 */

// ─── CORS / Headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restrict to your domain in production
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ─── Database Configuration ───────────────────────────────────────────────────
define('DB_HOST', 'localhost');       // Your MySQL host
define('DB_PORT', '3306');            // MySQL port (default: 3306)
define('DB_NAME', 'connectw_portfolio');    // Your database name
define('DB_USER', 'connectw_portfolio');            // Your MySQL username
define('DB_PASS', 'UKDb89CVrJppNVNvs6Ky');                // Your MySQL password

// ─── Input Retrieval ──────────────────────────────────────────────────────────
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Fallback to $_POST if not JSON
if (!$data) {
    $data = $_POST;
}

// ─── Validation ───────────────────────────────────────────────────────────────
$errors = [];

$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';

if (empty($name)) {
    $errors[] = 'Name is required.';
} elseif (strlen($name) > 100) {
    $errors[] = 'Name must be under 100 characters.';
}

if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
} elseif (strlen($email) > 150) {
    $errors[] = 'Email must be under 150 characters.';
}

if (empty($subject)) {
    $errors[] = 'Subject is required.';
} elseif (strlen($subject) > 200) {
    $errors[] = 'Subject must be under 200 characters.';
}

if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (strlen($message) > 5000) {
    $errors[] = 'Message must be under 5000 characters.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ─── Sanitize Inputs ─────────────────────────────────────────────────────────
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// ─── Database Connection ──────────────────────────────────────────────────────
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    // Log the real error server-side; never expose DB details to client
    error_log('Portfolio DB Connection Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database connection failed. Please try again later.']);
    exit;
}

// ─── Auto-create Table if Not Exists ─────────────────────────────────────────
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name        VARCHAR(100)  NOT NULL,
            email       VARCHAR(150)  NOT NULL,
            subject     VARCHAR(200)  NOT NULL,
            message     TEXT          NOT NULL,
            ip_address  VARCHAR(45)   DEFAULT NULL,
            user_agent  VARCHAR(300)  DEFAULT NULL,
            created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (PDOException $e) {
    http_response_code(500);
    error_log('Portfolio Table Creation Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
    exit;
}

// ─── Insert Record ────────────────────────────────────────────────────────────
try {
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = isset($_SERVER['HTTP_USER_AGENT'])
        ? substr($_SERVER['HTTP_USER_AGENT'], 0, 300)
        : null;

    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent)
        VALUES (:name, :email, :subject, :message, :ip, :ua)
    ");

    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':subject' => $subject,
        ':message' => $message,
        ':ip' => $ip,
        ':ua' => $user_agent,
    ]);

    $insertedId = $pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Message received! I\'ll get back to you soon.',
        'id' => $insertedId,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('Portfolio Insert Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to save your message. Please try again.']);
    exit;
}