import { deleteByName, findByName, updateByName } from '@/utils/database';
import { MODULES_KEY } from '@/constants';
import { failed, success } from '@/restful/response';
import $ from '@/core/app';
import { RequestInvalidError, ResourceNotFoundError } from '@/restful/errors';

export default function register($app) {
    if (!$.read(MODULES_KEY)) $.write([], MODULES_KEY);

    $app.route('/api/module/:name')
        .get(getModule)
        .patch(updateModule)
        .delete(deleteModule);

    $app.route('/api/modules')
        .get(getAllModules)
        .post(createModule)
        .put(replaceModule);
}

// module API
function createModule(req, res) {
    const module = req.body;
    $.info(`正在创建模块：${module.name}`);
    const allModules = $.read(MODULES_KEY);
    if (findByName(allModules, module.name)) {
        failed(
            res,
            new RequestInvalidError(
                'DUPLICATE_KEY',
                `Module ${module.name} already exists.`,
            ),
        );
    }
    allModules.push(module);
    $.write(allModules, MODULES_KEY);
    success(res, module, 201);
}

function getModule(req, res) {
    let { name } = req.params;
    name = decodeURIComponent(name);
    const allModules = $.read(MODULES_KEY);
    const module = findByName(allModules, name);
    if (module) {
        success(res, module);
    } else {
        failed(
            res,
            new ResourceNotFoundError(
                `MODULE_NOT_FOUND`,
                `Module ${name} does not exist`,
                404,
            ),
        );
    }
}

function updateModule(req, res) {
    let { name } = req.params;
    name = decodeURIComponent(name);
    let module = req.body;
    const allModules = $.read(MODULES_KEY);
    const oldModule = findByName(allModules, name);
    if (oldModule) {
        const newModule = {
            ...oldModule,
            ...module,
        };
        $.info(`正在更新模块：${name}...`);

        updateByName(allModules, name, newModule);
        $.write(allModules, MODULES_KEY);
        success(res, newModule);
    } else {
        failed(
            res,
            new ResourceNotFoundError(
                'RESOURCE_NOT_FOUND',
                `Module ${name} does not exist!`,
            ),
            404,
        );
    }
}

function deleteModule(req, res) {
    let { name } = req.params;
    name = decodeURIComponent(name);
    $.info(`正在删除模块：${name}`);
    let allModules = $.read(MODULES_KEY);
    deleteByName(allModules, name);
    $.write(allModules, MODULES_KEY);
    success(res);
}

function getAllModules(req, res) {
    const allModules = $.read(MODULES_KEY);
    success(res, allModules);
}

function replaceModule(req, res) {
    const allModules = req.body;
    $.write(allModules, MODULES_KEY);
    success(res);
}
