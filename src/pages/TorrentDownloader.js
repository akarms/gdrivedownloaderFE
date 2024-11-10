import { Container, Form, Button, Card, ProgressBar, Badge, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import * as consts from '../const';
import { DownloadedFiles } from '../components/downloadedFiles/DownloadedFiles';

function TorrentDownloader() {
    const [torrentUrl, setTorrentUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const [downloadSpeed, setDownloadSpeed] = useState(0);
    const [peers, setPeers] = useState(0);
    const [availability, setAvailability] = useState(0);
    const [downloadedFiles, setDownloadedFiles] = useState([]);
    const [totalDiskSpace, setTotalDiskSpace] = useState(0);
    const [freeDiskSpace, setFreeDiskSpace] = useState(0);
    const [isDownloadStarted, setIsDownloadStarted] = useState(false);

    useEffect(() => {
      const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${socketProtocol}//138.2.87.100:5555`);
              
        socket.onopen = () => console.log('WebSocket connection established.');
        socket.onerror = (error) => console.error('WebSocket error:', error);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data.progress);
            setDownloadSpeed(data.downloadSpeed);
            setPeers(data.peers);
            setAvailability(data.availability);
            setIsDownloadStarted(true);
        };
        socket.onclose = () => console.log('WebSocket connection closed.');

        return () => socket.close();
    }, []);

    useEffect(() => {
        const fetchDownloadedFiles = async () => {
            try {
                const response = await fetch(consts.TorrentDownloadFileslist);
                if (!response.ok) throw new Error('Failed to fetch file list from backend');
                const data = await response.json();
                setDownloadedFiles(data.files);
            } catch (error) {
                console.error('Error fetching server file info:', error);
            }
        };
        fetchDownloadedFiles();
    }, []);

    useEffect(() => {
        const fetchServerStorageInfo = async () => {
            try {
                const response = await fetch(consts.ServerInfo);
                if (!response.ok) throw new Error('Failed to fetch server storage info');
                const data = await response.json();

                setTotalDiskSpace(parseFloat(data.info.total) / (1024 * 1024 * 1024));
                setFreeDiskSpace(parseFloat(data.info.free) / (1024 * 1024 * 1024));
            } catch (error) {
                console.error('Error fetching server storage info:', error);
            }
        };
        fetchServerStorageInfo();
    }, []);

    const handleDownload = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(consts.TorrentDownload, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'magnetlink': torrentUrl }),
            });

            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            await response.json();
            console.log('Download initiation response:', response);
            setIsDownloadStarted(true);
        } catch (error) {
            console.error('Error initiating download:', error);
        }
    };

    const stopDownload = async () => {
        try {
            const response = await fetch(consts.StopTorrentDownload, { method: 'POST' });
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            
            await response.json();
            console.log('Download stopped.');
            setIsDownloadStarted(false);
            window.location.reload(false);
          } catch (error) {
            console.error('Error stopping download:', error);
        }
    };

    const handleDeleteFile = (fileName) => {
        setDownloadedFiles(downloadedFiles.filter((file) => file.name !== fileName));
    };

    const usedDiskSpace = totalDiskSpace - freeDiskSpace;
    const usedDiskPercentage = ((usedDiskSpace / totalDiskSpace) * 100).toFixed(2);

    return (
        <Container className="my-5">
            <h1 className="text-center mb-5">Torrent Downloader</h1>
            
            {/* Disk Space Info Card with Graph */}
            <Row className="justify-content-center mb-4">
                <Col md={6}>
                    <Card className="shadow-sm p-3">
                        <Card.Body>
                            <h5 className="text-center">Server Disk Space</h5>
                            <div className="d-flex justify-content-around mb-3">
                                <Badge bg="primary" className="p-2">
                                    Total Disk Space: {totalDiskSpace.toFixed(2)} GB
                                </Badge>
                                <Badge bg="success" className="p-2">
                                    Free Disk Space: {freeDiskSpace.toFixed(2)} GB
                                </Badge>
                            </div>
                            <ProgressBar>
                                <ProgressBar
                                    now={usedDiskPercentage}
                                    label={`Used: ${usedDiskPercentage}%`}
                                    variant="danger"
                                    className="progress-bar-striped progress-bar-animated"
                                />
                                <ProgressBar
                                    now={100 - usedDiskPercentage}
                                    label={`Free: ${(100 - usedDiskPercentage).toFixed(2)}%`}
                                    variant="success"
                                    className="progress-bar-striped progress-bar-animated"
                                />
                            </ProgressBar>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Torrent Download Card */}
            <Card className="shadow-lg mx-auto p-4" style={{ maxWidth: "600px" }}>
                <Card.Body>
                    <Form onSubmit={handleDownload}>
                        <Form.Group controlId="formTorrentUrl">
                            <Form.Control
                                type="text"
                                placeholder="Enter Torrent URL"
                                className="mb-3"
                                value={torrentUrl}
                                onChange={(e) => setTorrentUrl(e.target.value)}
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100 mb-3">
                            Start Download
                        </Button>
                    </Form>
                    {isDownloadStarted && (
                        <Button variant="danger" className="w-100 mb-3" onClick={stopDownload}>
                            Stop Download
                        </Button>
                    )}
                    <h5 className="text-center">Download Progress</h5>
                    <ProgressBar now={progress} label={`${progress}%`} animated className="my-3" />
                    <div className="d-flex justify-content-between">
                        <Badge bg="info" className="py-2">Speed: {downloadSpeed} MB/s</Badge>
                        <Badge bg="secondary" className="py-2">Peers: {peers}</Badge>
                        <Badge bg="success" className="py-2">Availability: {availability}</Badge>
                    </div>
                </Card.Body>
            </Card>

            <Container className="my-5">
                {/* Downloaded Files Component */}
                <DownloadedFiles files={downloadedFiles} onDelete={handleDeleteFile} />
            </Container>
        </Container>
    );
}

export { TorrentDownloader };
