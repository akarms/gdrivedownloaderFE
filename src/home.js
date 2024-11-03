import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button, Container, Form, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';

function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [driveInfo, setDriveInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const targetDirectory = './downloads';

  // Function to fetch files
  const fetchFiles = async (accessToken) => {
    try {
      const response = await fetch('http://138.2.87.100:5000/listFiles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files from backend');
      }

      const filesData = await response.json();
      setFiles(filesData);
      console.log(files)
    } catch (error) {
      console.error('Error fetching files from backend:', error);
      setError('Error fetching files from backend');
    }
  };

  // Function to fetch drive information
  const fetchDriveInfo = async (accessToken) => {
    try {
      const response = await fetch('http://138.2.87.100:5000/drive-info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drive information from backend');
      }

      const infoData = await response.json();
      setDriveInfo(infoData);
    } catch (error) {
      console.error('Error fetching drive info from backend:', error);
      setError('Error fetching drive information from backend');
    }
  };

  // Combined useEffect for fetching both files and drive info
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Access token not found. Please log in again.');
        return;
      }

      setLoading(true);
      await Promise.all([fetchFiles(accessToken), fetchDriveInfo(accessToken)]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('accessToken');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDownload = async () => {
    const availableSpaceInKb = driveInfo?.storageQuota
      ? (driveInfo.storageQuota.limit - driveInfo.storageQuota.usage) / 1024
      : null;

    try {
      setDownloading(true);
      const response = await fetch('http://138.2.87.100:5000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          url: downloadLink,
          targetDirectory: targetDirectory,
          availableSpace: availableSpaceInKb
        })
      });

      if (!response.ok) {
        setDownloading(false);
        throw new Error('Failed to download file from backend');
      }

      const data = await response.json();
      console.log('Download response:', data);
      setDownloading(false);
    } catch (error) {
      setDownloading(false);
      console.error('Error downloading:', error);
      setError('Error downloading file');
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Welcome to Your Google Drive Home Page</h1>
      <div className="d-flex justify-content-end mb-4">
        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Drive Information Card */}
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              Google Drive Information
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" variant="primary" />
                  <span className="ms-2">Loading drive information...</span>
                </div>
              ) : driveInfo ? (
                <>
                  <p><strong>User:</strong> {driveInfo.user?.displayName} ({driveInfo.user?.emailAddress})</p>
                  <p><strong>Total Storage:</strong> {(driveInfo.storageQuota?.limit / (1024 ** 3)).toFixed(2)} GB</p>
                  <p><strong>Used Storage:</strong> {(driveInfo.storageQuota?.usage / (1024 ** 3)).toFixed(2)} GB</p>
                </>
              ) : (
                <p className="text-center text-muted">No drive information found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Download Section */}
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-success text-white text-center">Download Files</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Download Link</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter download link" 
                    value={downloadLink} 
                    onChange={(e) => setDownloadLink(e.target.value)} 
                  />
                </Form.Group>
                {downloading ? (
                  <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="success" />
                    <span className="ms-2">Downloading file...</span>
                  </div>
                ) : (
                  <Button variant="success" size="lg" className="w-100" onClick={handleDownload}>
                    Download File
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Files Section */}
      {/* <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white text-center">Google Drive Files and Folders</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" variant="info" />
                  <span className="ms-2">Loading files...</span>
                </div>
              ) : files.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {files.map((file) => (
                    <li key={file.id} className="list-group-item">
                      <strong>{file.name}</strong> <span className="text-muted">({file.id})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted">No files found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </Container>
  );
}

export default Home;
