export const handleInvalidEndpoint = async (req, res) => {
  res.status(404).json({
    success: false,
    message: "This endpoint is disabled or not available.",
  });
};
