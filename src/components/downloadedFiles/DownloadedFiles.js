import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa'; // Import trash icon from react-icons
import * as consts from '../../const';

function DownloadedFiles({ files, onDelete }) {


    
    const handleDelete = async (fileName) => {
        try {
            const response = await fetch(`${consts.DeleteDownloadLink}/${fileName}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete ${fileName}`);
            }

            // Call the onDelete function passed from the parent to update the list
            onDelete(fileName);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div>
            <h2 className="text-center mb-4">Downloaded Files</h2>
            <Card className="shadow-lg p-4">
                <ListGroup variant="flush">
                    {files.map((file, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <a
                                    href={`${consts.GetDownloadLinkOfTorrent}/${file.name}`}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none me-3"
                                >
                                    {file.name}
                                </a>
                                <Badge bg="secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</Badge>
                            </div>
                            <FaTrash 
                                style={{ cursor: 'pointer', color: 'red' }}
                                onClick={() => handleDelete(file.name)}
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        </div>
    );
}

export { DownloadedFiles};
