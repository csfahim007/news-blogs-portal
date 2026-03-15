"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', contact_controller_1.createContactMessage);
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_controller_1.getAllContactMessages);
router.patch('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_controller_1.updateContactMessageStatus);
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_controller_1.deleteContactMessage);
exports.default = router;
