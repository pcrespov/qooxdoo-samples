"""

"""
import argparse
import os
import logging
import pathlib

# validates and transforms foreign data
import trafaret as T
from trafaret_config import commandline

SRC_DIR = pathlib.Path(__file__).parent.parent
DEFAULT_CONFIG_PATH = SRC_DIR / 'config' / 'server.yaml'
TEST_CONFIG_PATH = SRC_DIR / 'config' / 'server-test.yaml'

_LOGGER = logging.getLogger(__name__)

T_SCHEMA = T.Dict({
    T.Key('postgres'):
    T.Dict({
        'database': T.String(),
        'user': T.String(),
        'password': T.String(),
        'host': T.String(),
        'port': T.Int(),
        'minsize': T.Int(),
        'maxsize': T.Int(),
    }),
    T.Key('host'): T.IP,
    T.Key('port'): T.Int(),
})


def get_config(argv=None) -> dict:
    ap = argparse.ArgumentParser()

    # TODO: pass configuration to load via command line
    # TODO: pass configuration to init db via command line
    commandline.standard_argparse_options(
        ap,
        default_config=DEFAULT_CONFIG_PATH
    )

    # ignore unknown options
    options, unknown = ap.parse_known_args(argv)

    config = commandline.config_from_options(options, T_SCHEMA)

    if "IS_CONTAINER_CONTEXT" in os.environ.keys():
        config['host'] = '0.0.0.0'
        config['postgres']['host'] = 'db'

    _LOGGER.debug("Loading config %s \n\t %s", argv, config)

    return config


# TODO: load different type of configurations i.e. development, test/ci , production, etc
